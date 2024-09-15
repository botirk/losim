import { Defered, Rejection, WheelItem } from "../simulation/defered";
import { Unit } from "./unit";
import { DamageType } from "./unitInteraction";

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
    if (this.isCasting) return;
    const currentCast = this.unit.sim.waitFor(waitFor);
    for (const cancel of cancelEvents) currentCast.canceledBy(cancel[0], cancel[1]);
    currentCast.then(() => { if (this.currentCast === currentCast) this.currentCast = undefined; }).catch(() => {});
    this.currentCast = currentCast;
  }
  get remainingCast() {
    return this.currentCast?.remainingTime || 0;
  }
  protected changeCast(waitFor: number) {
    if (!this.currentCast) return;
    this.currentCast.waitFor = waitFor;
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
    if (this.isCooldown) return;
    const cooldown = this.unit.sim.waitFor(waitFor);
    cooldown.then(() => { if (this.cooldown === cooldown) this.cooldown = undefined; }).catch(() => {});
    this.cooldown = cooldown;
  }
  get remainingCooldown() {
    return this.cooldown?.remainingTime || 0;
  }
  protected changeCooldown(waitFor: number) {
    if (!this.cooldown) return;
    this.cooldown.waitFor = waitFor;
  }

  protected _onHitUnit: ((target: Unit) => void)[] = [];
  onHitUnit(cb: typeof this._onHitUnit[0]) {
    this._onHitUnit.push(cb);
    return () => {
      const i = this._onHitUnit.indexOf(cb);
      if (i !== -1) this._onHitUnit.splice(i, 1);
    }
  }
  procOnHitUnit(target: Unit) {
    for (const listener of this._onHitUnit) listener(target);
  }
}

export class Attack extends TimedSingletonAction {
  constructor(unit: Unit) {
    super("Attack", unit);
    unit.onBonusASChange(() => {
      if (this.isCasting) 
        this.changeCast((1 / unit.as) * unit.attackAnimation * 1000);
      else if (this.isCooldown)
        this.changeCooldown((1 / this.unit.as) * (1 - this.unit.attackAnimation) * 1000);
    });
  }

  protected _isCancelableByUser = true;

  async cast(target: Unit) {
    if (target.dead) return;
    const ownerDeathCancel = this.unit.interaction.onDeath(() => { this.cancelByDeath(); interuptPromise.reject(Rejection.UnitDeath); });
    const targetDeathCancel = target.interaction.onDeath(() => { this.cancelByTargetDeath(); interuptPromise.reject(Rejection.TargetDeath); });
    const interuptPromise = new Defered();
    interuptPromise.catch(() => {});
    try {
      if (this.isCooldown) await Promise.any([ this.waitForCooldown(), interuptPromise ]);
      if (this.isCasting) {
        await this.waitForCast();
      } else {
        this.startCast((1 / this.unit.as) * this.unit.attackAnimation * 1000);
        await this.waitForCast();
        target.interaction.takeDamage({ value: this.unit.ad, src: this.unit, type: DamageType.PHYSIC });
        this.procOnHitUnit(target);
        this.startCooldown((1 / this.unit.as) * (1 - this.unit.attackAnimation) * 1000);
      }
    } catch {

    } finally {
      ownerDeathCancel();
      targetDeathCancel();
    }
  }

  calc(target: Unit) {
    return target.interaction.calcPercentDamageReduction({ value: this.unit.ad, src: this.unit, type: DamageType.PHYSIC }).value;
  }
}

export class UnitAction {
  constructor(protected readonly unit: Unit) {}

  attack: Attack;

  init(): this { 
    this.attack = new Attack(this.unit);
    return this;
  }
}