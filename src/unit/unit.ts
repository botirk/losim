import { Simulation } from "../simulation/simulation";
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
  private _bonusAs = 0;
  get bonusAs() {
    return this._bonusAs;
  }
  set bonusAs(bonusAs: number) {
    this._bonusAs = bonusAs;
    for (const listener of this._onBonusASChange) listener();
  }
  private readonly _onBonusASChange: (() => void)[] = [];
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
  buffNamed(name: string): Buff | undefined {
    return this.buffs.find((buff) => buff.name === name);
  }

  private _currentCast?: AnyCast;
  get currentCast() {
    if (this._currentCast?.isCasting) return this._currentCast;
  }
  set currentCast(cast: AnyCast | undefined) {
    if (this._currentCast === cast) return;
    if (this._currentCast?.isCasting) this._currentCast.cancel();
    this._currentCast = cast;
    for (const listener of this._onCurrentCast) listener();
  }
  private _onCurrentCast: (() => void)[] = [];
  onCurrentCast(cb: typeof this._onCurrentCast[0]) {
    this._onCurrentCast.push(cb);
    return () => {
      const i = this._onCurrentCast.indexOf(cb);
      if (i !== -1) this._onCurrentCast.splice(i, 1);
    }
  }
  onCurrentCastPromise(exception?: AnyCast): Promise<void> {
    return new Promise<void>((res) => {
      const cancel = this.onCurrentCast(() => {
        if (exception === undefined || this._currentCast !== exception) {
          res();
          cancel();
        }
      });
    });
  }

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
    
    this.dead = false;
    return this;
  }
}