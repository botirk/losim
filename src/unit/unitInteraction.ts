import { Defered } from "../simulation/defered";
import { Unit } from "./unit";

export class UnitInteraction {
  constructor(readonly unit: Unit) {}

  takeDamage(value: number, src: Unit) {
    value = Math.min(this.unit.health, value);
    this.unit.health = Math.max(0, this.unit.health - value);
    for (const listener of this._onTakeDamage) listener(value, src);
    this._takedownTimes.set(src, this.unit.sim.time);
    if (this.unit.health === 0) {
      this.unit.dead = true;
      for (const listener of this.deathListeners) listener.resolve();
      src.interaction.kill(this.unit);
      for (const takedownTime of this._takedownTimes) {
        takedownTime[0].interaction.takedown(this.unit, takedownTime[1]);
        this._takedownTimes.delete(takedownTime[0]);
      }
      this.deathListeners = [];
    }
  }

  private readonly _onTakeDamage: ((value: number, src: Unit) => void)[] = [];
  onTakeDamage(cb: typeof this._onTakeDamage[0]) {
    this._onTakeDamage.push(cb);
    return () => {
      const i = this._onTakeDamage.indexOf(cb);
      if (i !== -1) this._onTakeDamage.splice(i, 1);
    }
  }

  private deathListeners: Defered[] = [];
  onDeath(): Defered {
    const prom = new Defered();
    this.deathListeners.push(prom);
    prom.catch(() => {
      const i = this.deathListeners.indexOf(prom);
      if (i != -1) this.deathListeners.splice(i, 1);
    });
    return prom;
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
}