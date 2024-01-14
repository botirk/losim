import { WheelItem } from "../simulation/defered";
import { Unit } from "./unit";
import { DamageType } from "./unitInteraction";

export abstract class TimedSingletonAction {
  constructor(public readonly name: string, protected unit: Unit) {

  }
  // settings
  abstract readonly minLevel: number;
  abstract readonly maxLevel: number;
  abstract readonly isCancelableByUser: boolean;
  abstract readonly waitForCooldownInCast: boolean;
  abstract readonly castCanceledWithCooldownReset: boolean;

  // level
  private _level = 0;
  get level() {
    return this._level;
  }
  set level(value: number) {
    this._level = Math.max(0, Math.min(this.maxLevel, value));
  }

  // cooldown & castTime
  abstract get castTime(): number;
  abstract get cooldownTime(): number;
  
  // cancels
  async cancelByUser() {
    if (!this.isCancelableByUser) throw new Error("Attempt to cancel uncancelable action");
    await this.cancel();
  }
  async cancel() {
    if (this.unit.action.current === this) this.unit.action.current = undefined;
    if (this.currentCast && this.currentCast.result === undefined) {
      this.currentCast.resolve(false);
      await this.unit.sim.clear();
    }
  }
  protected cancelInternal() {
    if (this.unit.action.current === this) this.unit.action.current = undefined;
    if (this.castCanceledWithCooldownReset) this.finishCooldown();
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
  protected async startCast() {
    if (!this.isCasting) {
      this.unit.action.current = this;
      this.currentCast = this.unit.sim.waitFor(this.castTime);
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
  protected async startCooldown() {
    if (!this.isCooldown) this.cooldown = this.unit.sim.waitFor(this.cooldownTime);
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

export abstract class SelfAction extends TimedSingletonAction {
  constructor(name: string, unit: Unit) {
    super(name, unit);
  }

  protected readinessInterruptPromise() {
    return Promise.any([ this.unit.onDeathPromise(), this.unit.action.onCurrentWithIgnorePromise(this) ]).then(() => false);
  }
  protected castInterruptPromise() {
    return Promise.any([ this.unit.onDeathPromise() ]).then(() => false);
  }

  protected abstract onStartCast?: () => Promise<void>;
  protected abstract onFinishCast?: () => Promise<void>;

  canCast() {
    return (this.unit.dead === false && (this.unit.action.current === undefined || this.unit.action.current === this) && this.level >= this.minLevel);
  }

  async cast() {
    if (!this.canCast()) return false;
    
    if (this.isCasting) return await this.waitForCast();

    if (this.isCooldown) {
      if (this.waitForCooldownInCast) {
        await Promise.any([ this.waitForCooldown(), this.readinessInterruptPromise() ]);
        if (!this.canCast()) return false;
      } else {
        return false;
      }
    }

    if (this.isCasting) return await this.waitForCast();

    this.startCast();
    this.startCooldown();
    this.onStartCast?.();
    const result = await Promise.any([this.waitForCast(), this.castInterruptPromise() ]);
    if (result === false || this.canCast() === false) {
      if (this.unit.action.current === this) this.unit.action.current = undefined;
      if (this.castCanceledWithCooldownReset) this.finishCooldown();
      return false;
    }
    
    this.onFinishCast?.();
    return true;
  }
}

export abstract class TargetAction extends TimedSingletonAction {
  constructor(name: string, unit: Unit) {
    super(name, unit);
  }

  protected readinessInterruptPromise(target: Unit) {
    return Promise.any([ target.onTargetablePromise(), this.unit.onDeathPromise(), this.unit.action.onCurrentWithIgnorePromise(this) ]).then(() => false);
  }
  protected castInterruptPromise(target: Unit) {
    return Promise.any([ target.onTargetablePromise(), this.unit.onDeathPromise() ]).then(() => false);
  }

  protected abstract onStartCast?: (target: Unit) => Promise<void>;
  protected abstract onFinishCast?: (target: Unit) =>  Promise<void>;

  canCast(target: Unit) {
    return (this.unit.dead === false && (this.unit.action.current === undefined || this.unit.action.current === this) && target.targetable === true && this.level >= this.minLevel);
  }

  async cast(target: Unit) {
    if (!this.canCast(target)) return false;
    
    if (this.isCasting) return await this.waitForCast();

    if (this.isCooldown) {
      if (this.waitForCooldownInCast) {
        await Promise.any([ this.waitForCooldown(), this.readinessInterruptPromise(target) ]);
        if (!this.canCast(target)) return false;
      } else {
        return false;
      }
    }

    if (this.isCasting) return await this.waitForCast();

    this.startCast();
    this.startCooldown();
    this.onStartCast?.(target);
    const result = await Promise.any([this.waitForCast(), this.castInterruptPromise(target) ]);
    if (result === false || this.canCast(target) === false) {
      if (this.unit.action.current === this) this.unit.action.current = undefined;
      if (this.castCanceledWithCooldownReset) this.finishCooldown();
      return false;
    }
    this.onFinishCast?.(target);
    return true;
  }
}

export class Attack extends TargetAction {
  constructor(unit: Unit) {
    super("Attack", unit);
    unit.onBonusASChange(() => {
      this.changeCast(this.castTime);
      this.changeCooldown(this.cooldownTime);
    });
  }
  // settings
  readonly minLevel: number = 0;
  readonly maxLevel: number = 0;
  readonly isCancelableByUser = true;
  readonly waitForCooldownInCast: boolean = true;
  readonly castCanceledWithCooldownReset: boolean = true;

  get castTime() {
    return (1 / this.unit.as) * this.unit.attackAnimation * 1000;
  }
  get cooldownTime() {
    return (1 / this.unit.as) * 1000;
  }

  protected onStartCast = undefined;
  protected onFinishCast = async (target: Unit) => {
    target.interaction.takeDamage({ value: this.unit.ad, src: this.unit, type: DamageType.PHYSIC });
    this.procOnHitUnit(target);
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
    for (const listener of this._onCurrent) listener();
  }
  protected _onCurrent: (() => void)[] = [];
  onCurrent(cb: typeof this._onCurrent[0]) {
    this._onCurrent.push(cb);
    return () => {
      const i = this._onCurrent.indexOf(cb);
      if (i !== -1) this._onCurrent.splice(i, 1);
    }
  }
  onCurrentPromise() {
    return new Promise<void>((res) => {
      const cancel = this.onCurrent(() => {
        cancel();
        res();
      });
    });
  }
  onCurrentWithIgnorePromise(toIgnore: TimedSingletonAction) {
    return new Promise<void>((res) => {
      const cancel = this.onCurrent(() => {
        if (this.current !== toIgnore) {
          cancel();
          res();
        }
      });
    });
  }

  init(): this { 
    this.attack = new Attack(this.unit);
    return this;
  }
}