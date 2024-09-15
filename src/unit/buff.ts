import { WheelItem } from "../simulation/defered";
import { Unit } from "./unit";

export class Buff {
  constructor(public readonly name: string, readonly owner: Unit, readonly unique: boolean = false, readonly src = owner) {
    if (unique && owner.buffNamed(name)) throw new Error(`Buff ${name} is unique`);
    owner.buffs.push(this);
  }

  get remainingTime() {
    return Infinity;
  }
  set remainingTime(remainingTime: number) { 
  }

  get duration() {
    return Infinity;
  }
  set duration(value: number) {

  }

  get isActive() {
    return this.owner.buffs.includes(this);
  }

  fade() {
    const i = this.owner.buffs.indexOf(this);
    if (i !== -1) this.owner.buffs.splice(i, 1);
  }
}

export class TimedBuff extends Buff {
  constructor(name: string, owner: Unit, timeToFade: number, unique: boolean = false, src = owner) {
    super(name, owner, unique, src);
    this.promise = owner.sim.waitFor(timeToFade);
    this.promise.then(() => this.fade());
  }
  private promise: WheelItem;

  get remainingTime() {
    return this.promise.remainingTime;
  }
  set remainingTime(remainingTime: number) {
    this.promise.remainingTime = remainingTime;
  }

  get duration(): number {
    return this.promise.waitFor;
  }
  set duration(value: number) {
    this.promise.waitFor = value;
  }

  fade(): void {
    this.promise.resolve(true);
    super.fade();
  }
}
