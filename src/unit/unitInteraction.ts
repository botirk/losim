import { Defered } from "../defered";
import { Unit } from "./unit";

export class UnitInteraction {
  constructor(readonly unit: Unit) {}

  takeDamage(value: number, src: Unit) {
    value = Math.min(this.unit.health, value);
    this.unit.health = Math.max(0, this.unit.health - value);
    for (const listener of this._onTakeDamage) listener(value, src);
    if (this.unit.health === 0) {
      this.unit.dead = true;
      for (const listener of this.deathListeners) listener.resolve();
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
}