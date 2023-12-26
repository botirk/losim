import { WheelItem } from "../simulation/defered";
import { Unit } from "./unit";

export class Buff {
  constructor(public readonly name: string, protected readonly unit: Unit) {
    unit.buffs.push(this);
    unit.lastBuff[name] = this;
  }

  get isActive() {
    return this.unit.buffs.includes(this);
  }

  fade() {
    const i = this.unit.buffs.indexOf(this);
    if (i !== -1) this.unit.buffs.splice(i, 1);
    if (this.unit.lastBuff[this.name] === this) delete this.unit.lastBuff[this.name];
  }
}

export class TimedBuff extends Buff {
  constructor(name: string, unit: Unit, timeToFade: number) {
    super(name, unit);
    this.promise = unit.sim.waitFor(timeToFade);
    this.promise.then(() => this.fade()).catch(() => {});
  }
  private promise: WheelItem;

  fade(): void {
    this.promise.resolve();
    super.fade();
  }
}
