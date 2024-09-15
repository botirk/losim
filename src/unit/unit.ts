import { Simulation } from "../simulation/simulation";
import { Watchable } from "../simulation/watchable";
import { UnitInteraction } from "./unitInteraction";
import { Buff } from "./buff";
import { AttackAction } from "./action/attack";
import { MoveAction } from "./action/move";
import { AnyCast } from "./action/action";

export class Actions {
  constructor(protected readonly owner: Unit) {}

  attack: AttackAction;
  move: MoveAction;

  init(): this { 
    this.attack = new AttackAction(this.owner);
    this.move = new MoveAction(this.owner);
    return this;
  }
}

class Targetable extends Watchable<boolean> {
  constructor(value: boolean, private readonly unit: Unit) {
    super(value);
    unit.dead.callback(() => super.value = this.value);
  }

  private _stacks = 0;
  get value() {
    return (!this.unit.dead.value && this._stacks <= 0);
  }
  set value(value: boolean) {
    if (value) {
      this._stacks = Math.max(0, this._stacks - 1);
    } else {
      this._stacks += 1;
    }
    super.value = this.value;
  }
}

class CurrentCast extends Watchable<undefined | AnyCast> {
  constructor(value: undefined | AnyCast) {
    super(value);
  }
  get value() {
    if (!super.value?.isCasting) return undefined; else return super.value;
  }
  set value(value: undefined | AnyCast) {
    super.value = value;
  }
}

export abstract class Unit {
  constructor(readonly name: string) { }

  sim: Simulation;

  abstract action: Actions;
  interaction: UnitInteraction;

  health = 0;
  maxHealth = 0;
  mana = 0;
  maxMana = 0;
  attackAnimation = 0.4;
  armor = 0;
  crit = 0;
  bonusCritDamage = 0;

  // move
  distance(unit: Unit) {
    return Math.abs(this.pos - unit.pos);
  }
  pos = 0;
  baseMs = 0;
  get ms() {
    return this.baseMs;
  }

  // ad
  attackRange = 175;
  baseAd = 0;
  bonusAd = 0;
  get ad() {
    return this.baseAd + this.bonusAd;
  }
  
  // attack speed related
  baseAs = 0;
  bonusAs = new Watchable(0);
  get as() {
    return this.baseAs * (1 + this.bonusAs.value / 100);
  }

  // death related
  dead = new Watchable(false);

  // targetable related
  targetable = new Targetable(true, this);

  // buffs
  buffs: Buff[] = [];
  buffsNamed(name: string) {
    return this.buffs.filter((buff) => buff.name === name);
  }
  buffNamed(name: string): Buff | undefined {
    return this.buffs.find((buff) => buff.name === name);
  }

  // cast
  currentCast = new CurrentCast(undefined);

  // logic
  async runAwayFromEnemyAsDummy(enemy: Unit) {
    await this.action.move.awayFrom(enemy);
  }
  async killDummy(enemy: Unit) {
    if (this.action.attack.currentCast && await this.action.attack.currentCast.wait()) return;
    else if (this.action.attack.isCooldown && await this.action.move.closeTo(enemy)) return;
    else if (await this.action.attack.cast(enemy)) return;
    else await this.action.move.closeTo(enemy);
  }

  init(simIN?: Simulation): this {
    if (!this.interaction) this.interaction = new UnitInteraction(this).init();
    if (this.sim) {
      const i = this.sim.units.indexOf(this);
      if (i !== -1) this.sim.units.splice(i, 1);
    }
    this.sim = simIN;
    if (simIN) {
      this.sim.units.push(this);
    }
    
    this.dead.value = false;
    return this;
  }
}