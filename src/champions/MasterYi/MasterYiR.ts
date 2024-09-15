import { TimedBuff } from "../../unit/buff";
import { Unit } from "../../unit/unit";
import { SelfCast, Action } from "../../unit/action/action";

export class MasterYiRBuff extends TimedBuff {
  private removeTakedown?: () => void;
  constructor(unit: Unit, readonly level: number) {
    level = Math.max(0, Math.min(3, level));
    super(MasterYiR.rname, unit, level ? 7000 : 0);
    if (!level) return;
    this.removeTakedown = unit.interaction.onTakedown((enemy, damagedTime) => {
      if (damagedTime + 10000 >= unit.sim.time) this.duration += 7000;
    });
    unit.bonusAs.value += 15 + level * 10;
  }
  fade(): void {
    super.fade();
    this.removeTakedown?.();
    this.owner.bonusAs.value -= 15 + this.level * 10;
  }
}

export class MasterYiRCast extends SelfCast<MasterYiR> {
  protected async onFinishCast() {
    new MasterYiRBuff(this.action.owner, this.action.level);
  }
}

export class MasterYiR extends Action<void, MasterYiRCast> {
  constructor(unit: Unit) {
    super(MasterYiR.rname, unit);
  }

  static readonly rname = "Highlander";
  readonly maxLevel: number = 3;
  readonly minLevel: number = 1;
  readonly isCancelableByUser: boolean = false;
  readonly isCooldownFinishedOnInterrupt: boolean = false;
  get manaCost(): number {
    if (this.level <= 0) return 0;
    return 100;
  }
  
  get castTime(): number {
    return 0;
  }
  get cooldownTime(): number {
    if (this.level === 0) return 0;
    return 85000;
  }
  async cast() {
    return await new MasterYiRCast(this).init();
  }
}