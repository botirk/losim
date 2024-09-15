import { WheelItem } from "../simulation/defered";
import { Action, AnyAction } from "./action/action";
import { Unit } from "./unit";

export class Buff {
  src: Unit;
  action: AnyAction;

  constructor(public readonly name: string, readonly owner: Unit, readonly unique: boolean = false, src?: Unit | AnyAction) {
    if (src instanceof Action) {
      this.action = src;
      this.src = src.owner;
    } else if (src instanceof Unit) {
      this.src = src;
    } else {
      this.src = owner;
    }

    if (unique && this.owner.buffNamed(name)) throw new Error(`Buff ${name} is unique`);
    this.owner.buffs.push(this);
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

  slow = 0;
}

export class TimedBuff extends Buff {
  constructor(name: string, owner: Unit, timeToFade: number, unique: boolean = false, src?: Unit | AnyAction) {
    super(name, owner, unique, src);
    this.promise = this.owner.sim.waitFor(timeToFade);
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

export class TimedSlow extends TimedBuff {
  constructor(name: string, owner: Unit, timeToFade: number, src: Unit | AnyAction, slow: number) {
    super(name, owner, timeToFade, true, src);
    this.slow = slow;
  }
}
