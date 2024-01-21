import { WheelItem } from "../simulation/defered";
import { Unit } from "./unit";


export type AnyAction = Action<any, AnyCast>;

export type AnyCast = Cast<any, AnyAction>;

export abstract class Action<TOption extends any, TCast> {
  constructor(readonly name: string, readonly owner: Unit) {

  }
  // settings
  abstract readonly minLevel: number;
  abstract readonly maxLevel: number;
  abstract readonly isCancelableByUser: boolean;
  abstract readonly isCooldownFinishedOnInterrupt: boolean;

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

  // cooldown
  private cooldown?: WheelItem;
  startCooldown() {
    if (!this.isCooldown) this.cooldown = this.owner.sim.waitFor(this.cooldownTime);
  }
  get isCooldown() {
    return !!this.cooldown && this.cooldown.result === undefined;
  }
  async waitCooldown() {
    await this?.cooldown;
  }
  get remainingCooldown() {
    return this.cooldown?.remainingTime || 0;
  }
  set remainingCooldown(value: number) {
    if (this.cooldown) this.cooldown.remainingTime = value;
  }
  protected setCooldown(waitFor: number) {
    if (this.cooldown) this.cooldown.waitFor = waitFor;
  }
  finishCooldown() {
    this.cooldown?.resolve(true);
    this.cooldown = undefined;
  }
  // cast
  castable(option: TOption): boolean {
    return this.level >= this.minLevel && (!this.owner.currentCast || this.castTime === 0) && !this.isCooldown && !this.owner.dead;
  }
  get currentCast(): TCast | undefined {
    if (this.owner.currentCast?.action === this) return this.owner.currentCast as TCast;
  }
  abstract cast(option: TOption): Promise<boolean>;
  // event
  protected _onCast: ((option: TOption) => void)[] = [];
  onCast(cb: typeof this._onCast[0]) {
    this._onCast.push(cb);
    return () => {
      const i = this._onCast.indexOf(cb);
      if (i !== -1) this._onCast.splice(i, 1);
    }
  }
  procOnCast(option: TOption) {
    for (const listener of this._onCast) listener(option);
  }
}

export abstract class EnemyTargetAction<TCast> extends Action<Unit, TCast> {
  protected _onHitUnit: ((target: Unit, multiplier: number) => void)[] = [];
  onHitUnit(cb: typeof this._onHitUnit[0]) {
    this._onHitUnit.push(cb);
    return () => {
      const i = this._onHitUnit.indexOf(cb);
      if (i !== -1) this._onHitUnit.splice(i, 1);
    }
  }
  procOnHitUnit(target: Unit, multiplier = 1) {
    for (const listener of this._onHitUnit) listener(target, multiplier);
  }
  castable(option: Unit): boolean {
    return super.castable && option.targetable;
  }
}

export abstract class Cast<TOption extends any, TAction extends Action<TOption, Cast<TOption, TAction>>> {
  constructor(readonly action: TAction, readonly option: TOption) {
    
  }

  private wheel?: WheelItem;
  get remaining() {
    return this.wheel?.remainingTime || 0;
  }
  set waitFor(waitFor: number) {
    if (this.wheel) this.wheel.waitFor = waitFor;
  }
  get isCasting() {
    return !!this.wheel && this.wheel.result === undefined;
  }
  async wait() {
    return await this.wheel;
  }
  protected async interrupt() {
    this.wheel?.resolve(false);
    await this.action.owner.sim.waitFor(0);
  }
  async cancel() {
    if (!this.action.isCancelableByUser) throw new Error(`${this.action.name}'s cast is not cancelable by user`);
    await this.interrupt();
  }

  protected async watchInterrupt() {};
  protected async onStartCast() {};
  protected async onFinishCast() {};
  async init() {
    if (this.action.currentCast) return this.action.currentCast.wait();
    if (!this.action.castable(this.option)) return false;
    if (this.action.castTime <= 0) {
      this.action.startCooldown();
      this.onStartCast();
      this.onFinishCast();
      return true;
    } else {
      this.wheel = this.action.owner.sim.waitFor(this.action.castTime);
      this.action.owner.currentCast = this;
      this.action.startCooldown();
      this.watchInterrupt();
      this.onStartCast();
      const result = await this.wheel;
      if (result) {
        this.onFinishCast();
        this.action.procOnCast(this.option);
      } else if (this.action.isCooldownFinishedOnInterrupt) {
        this.action.finishCooldown();
      }
      return result;
    }
  }
}

export abstract class SelfCast<TAction extends Action<void, Cast<void, TAction>>> extends Cast<void, TAction> {
  watchInterrupt: () => Promise<void> = async () => {
    const result = await Promise.any([ this.action.owner.onDeathPromise().then(() => false), this.wait() ]);
    if (result === false) this.interrupt();
  };
}

export abstract class TargetCast<TAction extends Action<Unit, Cast<Unit, TAction>>> extends Cast<Unit, TAction> {
  watchInterrupt: () => Promise<void> = async () => {
    const result = await Promise.any([ this.option.onTargetablePromise().then(() => false), this.action.owner.onDeathPromise().then(() => false), this.wait() ]);
    if (result === false) this.interrupt();
  };
}

export abstract class PosCast<TAction extends Action<number, Cast<number, TAction>>> extends Cast<number, TAction> {
  watchInterrupt: () => Promise<void> = async () => {
    const result = await Promise.any([ this.action.owner.onDeathPromise().then(() => false), this.wait() ]);
    if (result === false) this.interrupt();
  };
}