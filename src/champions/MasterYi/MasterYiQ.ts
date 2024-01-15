import { Unit } from "../../unit/unit";
import { Action, TargetCast } from "../../unit/unitAction";

export class MasterYiQCast extends TargetCast {
  protected async onStartCast() {
    /*this.unit.targetable = false;
    for (let time = 0; time < 231 * 4; time += 231) {
      await this.unit.sim.waitFor(231);
    }
    await this.unit.sim.waitFor(165);
    this.unit.targetable = true;*/
  }
}

export class MasterYiQ extends Action<Unit> {
  constructor(unit: Unit) {
    super(MasterYiQ.qname, unit);
  }

  static readonly qname = "Alpha Strike";
  readonly maxLevel: number = 5;
  readonly minLevel: number = 1;
  readonly isCancelableByUser: boolean = false;

  get castTime(): number {
    if (this.level === 0) return 0;
    return 231 * 4 + 165;
  }
  get cooldownTime(): number {
    if (this.level === 0) return 0;
    return 20500 - this.level * 500;
  }

  async cast(option: Unit) {
    return await new MasterYiQCast(this, option).init();
  }
}
