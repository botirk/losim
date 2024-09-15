import { Defered, Rejection, WheelItem } from "../defered";
import { Unit } from "./unit";

export abstract class TimedSingletonAction {
  constructor(public readonly name: string, protected unit: Unit) {

  }
  // settings
  private _level = 0;
  get level() {
    return this._level;
  }
  setLevel(value: number) {
    this._level = value;
  }
  // options
  protected _isCancelableByUser = false;

  get isCancelableByUser() { return this._isCancelableByUser; }
  cancelByUser() {
    if (!this._isCancelableByUser) throw new Error("Attempt to cancel uncancelable action");
    this.currentCast?.reject(Rejection.Canceled);
  }
  cancelByDeath() {
    this.currentCast?.reject(Rejection.UnitDeath);
  }
  cancelByTargetDeath() {
    this.currentCast?.reject(Rejection.TargetDeath);
  }

  private currentCast?: WheelItem;
  get isCasting() {
    return !!this.currentCast && !this.currentCast.isProcced;
  }
  async waitForCast() {
    try {
      if (this.currentCast && !this.currentCast.isProcced) await this.currentCast;
    } catch {
      
    } finally {
      if (this.currentCast?.isProcced) this.currentCast = undefined;
    }
  }
  protected startCast(waitFor: number, cancelEvents: Array<[Defered, Rejection]> = []) {
    if (this.currentCast) return;
    const currentCast = this.unit.sim.waitFor(waitFor);
    for (const cancel of cancelEvents) currentCast.canceledBy(cancel[0], cancel[1]);
    currentCast.then(() => { if (this.currentCast === currentCast) this.currentCast = undefined; }).catch(() => {});
    this.currentCast = currentCast;
  }

  private cooldown?: WheelItem;
  get isCooldown() {
    return !!this.cooldown && !this.cooldown.isProcced;
  }
  async waitForCooldown() {
    try {
      if (this.cooldown && !this.cooldown.isProcced) await this.cooldown;
    } catch {
      
    } finally {
      if (this.cooldown?.isProcced) this.cooldown = undefined;
    }
  }
  protected startCooldown(waitFor: number) {
    if (this.cooldown && !this.cooldown.isProcced) return;
    const cooldown = this.unit.sim.waitFor(waitFor);
    cooldown.then(() => { if (this.cooldown === cooldown) this.cooldown = undefined; }).catch(() => {});
    this.cooldown = cooldown;
  }
  get remainingCooldown() {
    return this.cooldown?.remainingTime || 0;
  }

  protected _onHitUnit: ((target: Unit) => void)[] = [];
  onHitUnit(cb: typeof this._onHitUnit[0]) {
    this._onHitUnit.push(cb);
    return () => {
      const i = this._onHitUnit.indexOf(cb);
      if (i !== -1) this._onHitUnit.splice(i, 1);
    }
  }
}

export class Attack extends TimedSingletonAction {
  constructor(unit: Unit) {
    super("Attack", unit);
  }

  protected _isCancelableByUser = true;

  async cast(target: Unit) {
    if (target.dead) return;
    const ownerDeath = this.unit.interaction.onDeath(), targetDeath = target.interaction.onDeath();
    try {
      if (this.isCooldown) await Promise.any([this.waitForCooldown(), targetDeath, ownerDeath]);
      if (this.isCasting) {
        await this.waitForCast();
      } else {
        this.startCast((1 / this.unit.as) * this.unit.attackAnimation * 1000, [[ownerDeath, Rejection.UnitDeath], [targetDeath, Rejection.TargetDeath]]);
        await this.waitForCast();
        target.interaction.takeDamage(this.unit.calcRawPhysicHit(this.unit.ad), this.unit);
        for (const listener of this._onHitUnit) listener(target);
        this.startCooldown((1 / this.unit.as) * (1 - this.unit.attackAnimation) * 1000);
      }
    } catch {

    } finally {
      targetDeath.reject(Rejection.RemoveEventListener);
      ownerDeath.reject(Rejection.RemoveEventListener);
    }
  }
}

export class UnitAction {
  constructor(protected readonly unit: Unit) {}

  readonly attack = new Attack(this.unit);
}