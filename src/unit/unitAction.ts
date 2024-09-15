import { WheelItem } from "../simulation/defered";
import { Unit } from "./unit";
import { DamageType } from "./unitInteraction";

export abstract class TimedSingletonAction {
  constructor(public readonly name: string, protected unit: Unit) {

  }
  // settings
  protected abstract readonly maxLevel: number;
  protected abstract _isCancelableByUser: boolean;
  private _level = 0;
  get level() {
    return this._level;
  }
  setLevel(value: number) {
    this._level = Math.max(0, Math.min(this.maxLevel, value));
  }
  // options
  

  get isCancelableByUser() { return this._isCancelableByUser; }
  cancelByUser() {
    if (!this._isCancelableByUser) throw new Error("Attempt to cancel uncancelable action");
    this.cancel();
  }
  cancel() {
    if (this.unit.action.current === this) this.unit.action.current = undefined;
    this.currentCast?.resolve(false);
    this.currentCast = undefined;
  }

  private currentCast?: WheelItem;
  get isCasting() {
    return !!this.currentCast && this.currentCast.result === undefined;
  }
  async waitForCast() {
    if (!this.isCasting) return true;
    const cc = this.currentCast;
    const result = await cc;
    if (this.unit.action.current === this) this.unit.action.current = undefined;
    if (this.currentCast === cc) this.currentCast = undefined;
    return result;
  }
  protected async startCast(waitFor: number) {
    if (!this.isCasting) {
      this.unit.action.current = this;
      this.currentCast = this.unit.sim.waitFor(waitFor);
    }
    return await this.waitForCast();
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
    return !!this.cooldown && this.cooldown.result === undefined;
  }
  async waitForCooldown() {
    if (!this.isCooldown) return true;
    const cc = this.cooldown;
    const result = await cc;
    if (this.cooldown === cc) this.cooldown = undefined;
    return result;
  }
  protected async startCooldown(waitFor: number) {
    if (!this.isCooldown) this.cooldown = this.unit.sim.waitFor(waitFor);
    return await this.waitForCooldown();
  }
  get remainingCooldown() {
    return this.cooldown?.remainingTime || 0;
  }
  protected changeCooldown(waitFor: number) {
    if (!this.cooldown) return;
    this.cooldown.waitFor = waitFor;
  }
  finishCooldown() {
    if (!this.cooldown) return;
    this.cooldown.resolve(true);
    this.cooldown = undefined;
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
  maxLevel: number = 0;
  protected _isCancelableByUser = true;

  async cast(target: Unit) {
    if (this.unit.dead || (this.unit.action.current && this.unit.action.current !== this) || target.dead) return;
    
    if (this.isCooldown) {
      await Promise.any([ this.waitForCooldown(), target.interaction.onDeathPromise(), this.unit.interaction.onDeathPromise() ]);
      if (this.unit.dead || (this.unit.action.current && this.unit.action.current !== this) || target.dead) return;
    }
    if (this.isCasting) {
      await this.waitForCast();
    } else {
      const result = await Promise.any([ this.startCast((1 / this.unit.as) * this.unit.attackAnimation * 1000), target.interaction.onDeathPromise(), this.unit.interaction.onDeathPromise() ]);
      if (result === true) {
        target.interaction.takeDamage({ value: this.unit.ad, src: this.unit, type: DamageType.PHYSIC });
        this.procOnHitUnit(target);
        this.startCooldown((1 / this.unit.as) * (1 - this.unit.attackAnimation) * 1000);
      } else if (result === undefined) {
        this.cancel();
      }
    }
  }

  calc(target: Unit) {
    return target.interaction.calcPercentDamageReduction({ value: this.unit.ad, src: this.unit, type: DamageType.PHYSIC }).value;
  }
}

export class UnitAction {
  constructor(protected readonly unit: Unit) {}

  attack: Attack;
  private _current?: TimedSingletonAction;
  get current(): TimedSingletonAction | undefined {
    if (this._current?.isCasting) return this._current;
  }
  set current(newCurrent: TimedSingletonAction) {
    if (newCurrent && this.current) throw new Error("UnitAction.current not checked");
    this._current = newCurrent;
  }

  init(): this { 
    this.attack = new Attack(this.unit);
    return this;
  }
}