import { Defered } from "../defered";
import { Unit } from "./unit";

export class UnitInteraction {
  constructor(readonly unit: Unit) {}

  takeDamage(value: number) {
    value = Math.min(this.unit.health, value);
    this.unit.health = Math.max(0, this.unit.health - value);
    for (const listener of this.takeDamageListeners) listener.resolve(value);
    this.takeDamageListeners = [];
    if (this.unit.health === 0) {
      this.unit.dead = true;
      this.unit.action.cancelAttack();
      for (const listener of this.deathListeners) listener.resolve();
      this.deathListeners = [];
    }
  }

  takeDamageListeners: Defered<number>[] = [];
  onTakeDamage(): Defered<number> {
    const prom = new Defered<number>();
    this.takeDamageListeners.push(prom);
    prom.catch(() => {
      const i = this.takeDamageListeners.indexOf(prom);
      if (i != -1) this.takeDamageListeners.splice(i, 1);
    });
    return prom;
  }

  deathListeners: Defered[] = [];
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