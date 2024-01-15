import { WheelItem } from "../simulation/defered";
import { Unit } from "./unit";

export abstract class UnitAction {
  constructor(readonly name: string, readonly unit: Unit) {

  }
  // settings
  abstract readonly minLevel: number;
  abstract readonly maxLevel: number;

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
    if (!this.cooldown) return;
    this.cooldown.waitFor = waitFor;
  }
  finishCooldown() {
    this.cooldown?.resolve(true);
    this.cooldown = undefined;
  }
}

export abstract class EnemyTargetAction extends UnitAction {
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

export abstract class Cast<TOption = any> {
  constructor(readonly action: UnitAction, readonly option: TOption) {
    
  }
  abstract readonly isCancelableByUser: boolean;

  private wheel?: WheelItem;
  get remaining() {
    return this.wheel?.remainingTime || 0;
  }
  set remaining(remaining: number) {
    if (this.wheel) this.wheel.remainingTime = remaining;
  }
  get isCasting() {
    return !!this.wheel && this.wheel.result === undefined;
  }
  async wait() {
    return await this.wheel;
  }
  protected interrupt() {
    this.wheel?.resolve(false);
  }
  cancel() {
    if (!this.isCancelableByUser) throw new Error(`${this.action.name}'s cast is not cancelable by user`);
    this.interrupt();
  }
  get castable(): boolean {
    return !this.action.unit.dead;
  }

  protected async watchInterrupt() {};
  protected async onStartCast() {};
  protected async onFinishCast() {};
  async init() {
    if (!this.castable) return false;
    this.wheel = this.action.unit.sim.waitFor(this.action.castTime);
    this.watchInterrupt();
    this.onStartCast();
    const result = await this.wheel;
    if (result) this.onFinishCast();
    return result;
  }
}

export abstract class SelfCast extends Cast<void> {
  watchInterrupt: () => Promise<void> = async () => {
    const result = await Promise.any([ this.action.unit.onDeathPromise().then(() => false), this.wait() ]);
    if (result === false) this.interrupt();
  };
}

export abstract class TargetCast extends Cast<Unit> {
  get castable(): boolean {
    return super.castable && this.option.targetable;
  }
  watchInterrupt: () => Promise<void> = async () => {
    const result = await Promise.any([ this.option.onTargetablePromise(), this.action.unit.onDeathPromise().then(() => false), this.wait() ]);
    if (result === false) this.interrupt();
  };
}

export class UnitActions {
  constructor(protected readonly unit: Unit) {}

  // attack: Attack;

  private _currentCast?: Cast;
  get currentCast(): Cast | undefined {
    if (this._currentCast?.isCasting) return this._currentCast;
  }
  set currentCast(newCurrent: Cast | undefined) {
    if (newCurrent && this._currentCast && this._currentCast.isCasting) this._currentCast.cancel();
    this._currentCast = newCurrent;
  }

  init(): this { 
    //this.attack = new Attack(this.unit);
    return this;
  }
}