import { Simulation } from "../simulation/simulation";
import { UnitAction } from "./unitAction";
import { UnitInteraction } from "./unitInteraction";
import { Buff } from "./buff";

export abstract class Unit {
  sim: Simulation;

  abstract action: UnitAction;
  interaction: UnitInteraction;

  health = 0;
  maxHealth = 0;
  ad = 0;
  attackAnimation = 0.4;
  armor = 0;
  dead = false;
  
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

  buffs: Buff[] = [];
  buffsNamed(name: string) {
    return this.buffs.filter((buff) => buff.name === name);
  }

  calcRawPhysicHit(value: number): number {
    return (1 - this.armor/(100 + this.armor)) * value;
  }
  init(simIN?: Simulation): this {
    if (!this.interaction) this.interaction = new UnitInteraction(this);
    this.sim = simIN;
    this.dead = false;
    return this;
  }
}