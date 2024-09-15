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
}

export class UnitInteraction {
  constructor(readonly unit: Unit) {}

  takeDamage(e: DamageEvent) {
    // prevent beating the dead
    if (this.unit.dead === true) return;
    // percent damage reduction
    for (const listener of this._percentDamageReduction) listener(e);
    // fix
    e.value = Math.max(0, Math.min(this.unit.health, e.value));
    // reduce health
    this.unit.health = Math.max(0, this.unit.health - e.value);
    // events
    for (const listener of this._onTakeDamage) listener(e);
    this._takedownTimes.set(e.src, this.unit.sim.time);
    if (this.unit.health === 0) {
      this.unit.dead = true;
      this.unit.action.current?.cancel();
      for (const listener of this._deathListeners) listener();
      e.src.interaction.kill(this.unit);
      for (const takedownTime of this._takedownTimes) {
        takedownTime[0].interaction.takedown(this.unit, takedownTime[1]);
        this._takedownTimes.delete(takedownTime[0]);
      }
    }
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
  calcPercentDamageReduction(e: DamageEvent) {
    for (const listener of this._percentDamageReduction) listener(e);
    return e;
  }
  calcArmorDamageReduction(e: DamageEvent) {
    if (e.type === DamageType.PHYSIC) e.value = (1 - this.unit.armor/(100 + this.unit.armor)) * e.value;
    return e;
  }

  private readonly _deathListeners: (() => void)[] = [];
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
    return this;
  }
}