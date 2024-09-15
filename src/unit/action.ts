import { WheelItem } from "../simulation/defered";
import { Unit } from "./unit";

export abstract class Action<TOption extends any> {
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
  get currentCast(): Cast | undefined {
    if (this.owner.currentCast?.action === this) return this.owner.currentCast;
  }
  abstract cast(option: TOption): Promise<boolean>;
}

export abstract class EnemyTargetAction extends Action<Unit> {
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
  castable(option: Unit): boolean {
    return super.castable && option.targetable;
  }
}

export abstract class Cast<TOption = any> {
  constructor(readonly action: Action<TOption>, readonly option: TOption) {
    
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
    this.wheel = this.action.owner.sim.waitFor(this.action.castTime);
    this.action.owner.currentCast = this;
    this.action.startCooldown();
    this.watchInterrupt();
    this.onStartCast();
    const result = await this.wheel;
    if (result) this.onFinishCast();
    else if (this.action.isCooldownFinishedOnInterrupt) this.action.finishCooldown();
    return result;
  }
}

export abstract class SelfCast extends Cast<void> {
  watchInterrupt: () => Promise<void> = async () => {
    const result = await Promise.any([ this.action.owner.onDeathPromise().then(() => false), this.wait() ]);
    if (result === false) this.interrupt();
  };
}

export abstract class TargetCast extends Cast<Unit> {
  watchInterrupt: () => Promise<void> = async () => {
    const result = await Promise.any([ this.option.onTargetablePromise().then(() => false), this.action.owner.onDeathPromise().then(() => false), this.wait() ]);
    if (result === false) this.interrupt();
  };
}