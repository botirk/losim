import { Simulation } from "../simulation/simulation";
import { Watchable } from "../simulation/watchable";
import { UnitInteraction } from "./unitInteraction";
import { Buff } from "./buff";
import { AttackAction } from "./action/attack";
import { MoveAction } from "./action/move";
import { AnyCast } from "./action/action";
import { Equip } from "./equip";

export type UnitTeam = "RED" | "BLUE" | "DEATHMATCH" | "NEUTRAL";

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

  level = 1;
  health = 0;
  maxHealth = 0;
  mana = 0;
  maxMana = 0;
  armor = 0;
  mr = 0;
  abstract isMelee: boolean;

  // team 
  team: UnitTeam = "DEATHMATCH";
  isEnemy(unit: Unit) {
    return unit !== this && this.team === "DEATHMATCH" || unit.team === "DEATHMATCH" || unit.team !== this.team;
  }

  // move
  distance(unit: Unit) {
    return Math.abs(this.pos - unit.pos);
  }
  pos = 0;
  baseMs = 0;
  bonusMs = 0;
  /** multiplicative move speed. default is 1. 30% increase is 1.3 */
  mMs = 1;
  get ms() {
    let result = (this.baseMs + this.bonusMs) * this.mMs * ((100 - this.slow) / 100);

    if (result <= 0) result = 110;
    else if (result < 220) result = 110 + result * 0.5
    else if (result > 415 && result < 490) result = result * 0.8 + 83;
    else if (result > 490) result = result * 0.5 + 230;

    return result;
  }
  get slow(): number {
    return this.buffs.reduce((prev, cur) => cur.slow > prev ? cur.slow : prev, 0);
  }

  // cdr
  /** 10% cdr is 10 here */
  abilityHaste = 0;
  get abilityHasteModifier() {
    return 100 / (100 + this.abilityHaste);
  }

  // ad
  attackRange = 175;
  attackAnimation = 0.4;
  baseAd = 0;
  bonusAd = 0;
  lifesteal = 0;
  crit = 0;
  bonusCritDamage = 0;
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

  // item
  private _itemCount = 0;
  get itemCount() {
    return this._itemCount;
  }
  appliedEquips: Equip[] = [];
  applyEquip(equip: Equip) {
    if (equip.unique && this.appliedEquips.includes(equip)) return false;
    if (equip.uniqueGroup && this.appliedEquips.some(e => e.uniqueGroup === equip.uniqueGroup)) return false;
    if (equip.type === "item" || equip.type === "finishedItem") {
      if (this._itemCount >= 6) return false;
      this._itemCount += 1;
    }
    
    if (equip.apply?.(this) === false) return false;
    
    if (equip.bonusAs) this.bonusAs.value += equip.bonusAs;
    if (equip.bonusAd) this.bonusAd += equip.bonusAd;
    if (equip.crit) this.crit = Math.max(0, Math.min(100, this.crit + equip.crit));
    if (equip.bonusCritDamage) this.bonusCritDamage += equip.bonusCritDamage;
    if (equip.lifesteal) this.lifesteal += equip.lifesteal;

    if (equip.armor) this.armor += equip.armor;
    if (equip.mr) this.mr += equip.mr;

    if (equip.maxHealth) this.maxHealth += equip.maxHealth;
    if (equip.maxMana) this.maxMana += equip.maxMana;

    if (equip.bonusMs) this.bonusMs += equip.bonusMs;

    if (equip.abilityHaste) this.abilityHaste += equip.abilityHaste;

    this.appliedEquips.push(equip);

    return true;
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

  init(simIN?: Simulation, team: UnitTeam = this.team, level: number = this.level): this {
    if (!this.interaction) this.interaction = new UnitInteraction(this).init();
    if (this.sim) {
      const i = this.sim.units.indexOf(this);
      if (i !== -1) this.sim.units.splice(i, 1);
    }
    this.sim = simIN;
    if (simIN) {
      this.sim.units.push(this);
    }
    
    this.team = team;
    this.level = level;
    this.dead.value = false;
    return this;
  }
}