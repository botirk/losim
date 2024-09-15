import { Action, PosCast } from "./action";
import { Unit } from "../unit";

export class MoveAction extends Action<number, MoveCast> {
  constructor(owner: Unit) {
    super("Move", owner);
  }

  readonly minLevel: number = 0;
  readonly maxLevel: number = 0;
  readonly isCancelableByUser: boolean = true;
  readonly isCooldownFinishedOnInterrupt: boolean = true;

  get castTime() {
    return this.owner.sim.tickTime;
  }
  get cooldownTime() {
    return 0;
  }
  get value() {
    return this.owner.ms * (this.owner.sim.tickTime / 1000);  
  }
  cast(option: number) {
    return new MoveCast(this, option).init();
  }
  awayFrom(unit: Unit) {
    if (unit.pos <= this.owner.pos) return this.cast(Infinity);
    else return this.cast(-Infinity);
  }
  closeTo(unit: Unit) {
    return this.cast(unit.pos);
  }
}

export class MoveCast extends PosCast<MoveAction> {
  protected async onFinishCast() {
    const dif = this.option - this.action.owner.pos;
    if (dif >= 0) {
      this.action.owner.pos += Math.min(dif, this.action.value);
    } else {
      this.action.owner.pos += Math.max(dif, -this.action.value);
    }
  }
}