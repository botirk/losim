import { WheelItem } from "../simulation/defered";
import { Unit } from "./unit";

export class Buff {
  constructor(public readonly name: string, protected readonly unit: Unit) {
    unit.buffs.push(this);
  }

  get remainingTime() {
    return Infinity;
  }

  get duration() {
    return Infinity;
  }
  set duration(value: number) {

  }

  get isActive() {
    return this.unit.buffs.includes(this);
  }

  fade() {
    const i = this.unit.buffs.indexOf(this);
    if (i !== -1) this.unit.buffs.splice(i, 1);
  }
}

export class TimedBuff extends Buff {
  constructor(name: string, unit: Unit, timeToFade: number) {
    super(name, unit);
    this.promise = unit.sim.waitFor(timeToFade);
    this.promise.then(() => this.fade()).catch(() => {});
  }
  private promise: WheelItem;

  get remainingTime() {
    return this.promise.remainingTime;
  }

  get duration(): number {
    return this.promise.waitFor;
  }
  set duration(value: number) {
    this.promise.waitFor = value;
  }

  fade(): void {
    this.promise.resolve();
    super.fade();
  }
}
