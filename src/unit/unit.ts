import { Simulation } from "../simulation/simulation";
import { UnitAction } from "./unitAction";
import { UnitInteraction } from "./unitInteraction";
import { Buff } from "./buff";

export abstract class Unit {
  sim: Simulation;

  abstract action: UnitAction;
  interaction: UnitInteraction = new UnitInteraction(this);

  health = 0;
  maxHealth = 0;
  ad = 0;
  attackAnimation = 0.4;
  armor = 0;
  as = 0;
  dead = false;
  buffs: Buff[] = [];

  calcRawPhysicHit(value: number): number {
    return (1 - this.armor/(100 + this.armor)) * value;
  }
  init(simIN?: Simulation): this {
    this.sim = simIN;
    this.dead = false;
    return this;
  }
}