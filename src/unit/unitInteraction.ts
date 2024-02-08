import { Unit } from "./unit";

export enum DamageType {
  TRUE = 0,
  PHYSIC = 1,
  MAGIC = 2,
}

export interface DamageEvent {
  src: Unit,
  value: number,
  type: DamageType,
  isCrit?: boolean,
}

export interface HealEvent {
  src: Unit,
  value: number,
}

export class UnitInteraction {
  constructor(readonly unit: Unit) {}

  takeHeal(e: HealEvent) {
    // prevent beating the dead
    if (this.unit.dead.value === true) return;
    // fix
    e.value = Math.max(0, Math.min(this.unit.maxHealth, e.value));
    // increase health
    this.unit.health += e.value;
  }

  takeDamage(e: DamageEvent): DamageEvent {
    // prevent beating the dead
    if (this.unit.dead.value === true) return { ...e, value: 0 };
    // damage reduction
    this.calcDamageReduction(e);
    // fix
    e.value = Math.max(0, Math.min(this.unit.health, e.value));
    // reduce health
    this.unit.health = Math.max(0, this.unit.health - e.value);
    // events
    for (const listener of this._onTakeDamage) listener(e);
    this._takedownTimes.set(e.src, this.unit.sim.time);
    if (this.unit.health === 0) {
      this.unit.dead.value = true;
      e.src.interaction.kill(this.unit);
      for (const takedownTime of this._takedownTimes) {
        takedownTime[0].interaction.takedown(this.unit, takedownTime[1]);
        this._takedownTimes.delete(takedownTime[0]);
      }
    }
    return e;
  }

  private readonly _onTakeDamage: ((e: Readonly<DamageEvent>) => void)[] = [];
  onTakeDamage(cb: typeof this._onTakeDamage[0]) {
    this._onTakeDamage.push(cb);
    return () => {
      const i = this._onTakeDamage.indexOf(cb);
      if (i !== -1) this._onTakeDamage.splice(i, 1);
    }
  }

  private readonly _percentDamageReduction: ((e: DamageEvent) => void)[] = [];
  percentDamageReduction(cb: typeof this._percentDamageReduction[0]) {
    this._percentDamageReduction.push(cb);
    return () => {
      const i = this._percentDamageReduction.indexOf(cb);
      if (i !== -1) this._percentDamageReduction.splice(i, 1);
    }
  }
  calcArmorDamageReduction(e: DamageEvent) {
    if (e.type === DamageType.PHYSIC) e.value = (1 - this.unit.armor/(100 + this.unit.armor)) * e.value;
    return e;
  }
  calcMrDamageReduction(e: DamageEvent) {
    if (e.type === DamageType.MAGIC) e.value = (1 - this.unit.mr/(100 + this.unit.mr)) * e.value;
    return e;
  }

  private readonly _flatDamageReduction: ((e: DamageEvent) => void)[] = [];
  flatDamageReduction(cb: typeof this._flatDamageReduction[0]) {
    this._flatDamageReduction.push(cb);
    return () => {
      const i = this._flatDamageReduction.indexOf(cb);
      if (i !== -1) this._flatDamageReduction.splice(i, 1);
    }
  }

  private readonly _finalDamageReduction: ((e: DamageEvent) => void)[] = [];
  finalDamageReduction(cb: typeof this._finalDamageReduction[0]) {
    this._finalDamageReduction.push(cb);
    return () => {
      const i = this._finalDamageReduction.indexOf(cb);
      if (i !== -1) this._finalDamageReduction.splice(i, 1);
    }
  }

  calcDamageReduction(e: DamageEvent) {
    for (const listener of this._flatDamageReduction) listener(e);
    for (const listener of this._percentDamageReduction) listener(e);
    for (const listener of this._finalDamageReduction) listener(e);
    return e;
  }

  private readonly _onKill: ((unit: Unit) => void)[] = [];
  onKill(cb: typeof this._onKill[0]) {
    this._onKill.push(cb);
    return () => {
      const i = this._onKill.indexOf(cb);
      if (i !== -1) this._onKill.splice(i, 1);
    }
  }
  kill(killed: Unit) {
    for (const listener of this._onKill) listener(killed);
  }

  private readonly _takedownTimes = new Map<Unit, number>();
  private readonly _onTakedown: ((unit: Unit, damagedTime: number) => void)[] = [];
  onTakedown(cb: typeof this._onTakedown[0]) {
    this._onTakedown.push(cb);
    return () => {
      const i = this._onTakedown.indexOf(cb);
      if (i !== -1) this._onTakedown.splice(i, 1);
    }
  }
  takedown(takedowned: Unit, damagedTime: number) {
    for (const listener of this._onTakedown) listener(takedowned, damagedTime);
  }

  init() {
    this.percentDamageReduction((e) => this.calcArmorDamageReduction(e));
    this.percentDamageReduction((e) => this.calcMrDamageReduction(e));
    return this;
  }
}