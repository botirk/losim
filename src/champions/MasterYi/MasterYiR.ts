import { TimedBuff } from "../../unit/buff";
import { Unit } from "../../unit/unit";
import { SelfCast, Action } from "../../unit/action/action";

export class MasterYiRBuff extends TimedBuff {
  private removeTakedown?: () => void;
  private level = 0;
  constructor(unit: Unit, action: MasterYiR) {
    super(MasterYiR.rname, unit, action.level ? MasterYiR.duration : 0);
    if (!action.level) return;
    this.level = action.level;
    this.removeTakedown = unit.interaction.onTakedown((_, damagedTime) => {
      if (damagedTime + MasterYiR.assistDuration >= unit.sim.time) this.duration += MasterYiR.duration;
    });
    unit.mMs *= MasterYiR.bonusMMs(this.level);
    unit.bonusAs.value += MasterYiR.bonusAs(this.level);
  }
  fade(): void {
    super.fade();
    this.removeTakedown?.();
    this.owner.mMs /= MasterYiR.bonusMMs(this.level);
    this.owner.bonusAs.value -= MasterYiR.bonusAs(this.level);
  }
}

export class MasterYiRCast extends SelfCast<MasterYiR> {
  protected async onFinishCast() {
    new MasterYiRBuff(this.action.owner, this.action);
  }
}

export class MasterYiR extends Action<void, MasterYiRCast> {
  static readonly duration = 7000;
  static readonly assistDuration = 10000;
  static bonusAs(level: number) {
    return 15 + level * 10;
  }
  static bonusMMs(level: number) {
    return 1 + (25 + level * 10) / 100;
  }

  constructor(unit: Unit) {
    super(MasterYiR.rname, unit);
  }

  static readonly rname = "Highlander";
  readonly maxLevel: number = 3;
  readonly minLevel: number = 1;
  readonly isCancelableByUser: boolean = false;
  readonly isCooldownFinishedOnInterrupt: boolean = false;
  readonly isUltimate: boolean = true;

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