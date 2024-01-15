import { Simulation } from "../simulation/simulation";
import { UnitActions } from "./unitAction3";
import { UnitInteraction } from "./unitInteraction";
import { Buff } from "./buff";

export abstract class Unit {
  sim: Simulation;

  abstract action: UnitActions;
  interaction: UnitInteraction;

  health = 0;
  maxHealth = 0;
  ad = 0;
  attackAnimation = 0.4;
  armor = 0;
  
  
  // attack speed related
  baseAs = 0;
  private _bonusAs = 0;
  get bonusAs() {
    return this._bonusAs;
  }
  set bonusAs(bonusAs: number) {
    this._bonusAs = bonusAs;
    for (const listener of this._onBonusASChange) listener(bonusAs);
  }
  private readonly _onBonusASChange: ((newValue: number) => void)[] = [];
  onBonusASChange(cb: typeof this._onBonusASChange[0]) {
    this._onBonusASChange.push(cb);
    return () => {
      const i = this._onBonusASChange.indexOf(cb);
      if (i !== -1) this._onBonusASChange.splice(i, 1);
    }
  }
  get as() {
    return this.baseAs * (1 + this._bonusAs / 100);
  }

  // death related
  private _dead = false;
  get dead() {
    return this._dead;
  }
  set dead(state: boolean) {
    if (state === this._dead) return;
    if (state === true) this.action.current?.cancel();
    const oldT = this.targetable;
    this._dead = state;
    for (const listener of this._deathListeners) listener(state);
    const newT = this.targetable;
    if (oldT !== newT) for (const listener of this._targetableListeners) listener(newT);
  }
  private readonly _deathListeners: ((dead: boolean) => void)[] = [];
  onDeath(cb: typeof this._deathListeners[0]) {
    this._deathListeners.push(cb);
    return () => {
      const i = this._deathListeners.indexOf(cb);
      if (i !== -1) this._deathListeners.splice(i, 1);
    }
  }
  onDeathPromise() {
    return new Promise<void>((resolve) => {
      const cancel = this.onDeath(() => {
        cancel();
        resolve();
      });
    });
  }

  // targetable related
  private _targetable = 0;
  get targetable(): boolean {
    return this.dead === false && this._targetable <= 0;
  }
  set targetable(value: boolean) {
    const old = this.targetable;
    if (value) {
      this._targetable = Math.max(0, this._targetable - 1);
    } else {
      this._targetable += 1;
    }
    const new1 = this.targetable;
    if (old !== new1) for (const listener of this._targetableListeners) listener(new1);
  }
  private readonly _targetableListeners: ((targetable: boolean) => void)[] = [];
  onTargetable(cb: typeof this._targetableListeners[0]) {
    this._targetableListeners.push(cb);
    return () => {
      const i = this._targetableListeners.indexOf(cb);
      if (i !== -1) this._targetableListeners.splice(i, 1);
    }
  }
  onTargetablePromise() {
    return new Promise<void>((resolve) => {
      const cancel = this.onTargetable((targetable) => {
        cancel();
        resolve();
      });
    });
  }

  buffs: Buff[] = [];
  buffsNamed(name: string) {
    return this.buffs.filter((buff) => buff.name === name);
  }

  init(simIN?: Simulation): this {
    if (!this.interaction) this.interaction = new UnitInteraction(this).init();
    this.sim = simIN;
    this.dead = false;
    return this;
  }
}