import { TimedBuff } from "../../unit/buff";
import { Unit } from "../../unit/unit";
import { SelfCast, Action } from "../../unit/action/action";

export class MasterYiRBuff extends TimedBuff {
  constructor(action: MasterYiR) {
    super(MasterYiR.rname, action.owner, action.level ? MasterYiR.duration : 0, true, action);
    if (!action.level) return;
    this.removeTakedown = action.owner.interaction.onTakedown((_, damagedTime) => {
      if (damagedTime + MasterYiR.assistDuration >= action.owner.sim.time) this.duration += MasterYiR.duration;
    });
    action.owner.mMs *= MasterYiR.bonusMMs(this.action.level);
    action.owner.bonusAs.value += MasterYiR.bonusAs(this.action.level);
  }
  private removeTakedown?: () => void;
  fade(): void {
    if (!this.isActive) return;
    super.fade();
    this.removeTakedown?.();
    this.owner.mMs /= MasterYiR.bonusMMs(this.action.level);
    this.owner.bonusAs.value -= MasterYiR.bonusAs(this.action.level);
  }
}

export class MasterYiRCast extends SelfCast<MasterYiR> {
  protected async onFinishCast() {
    new MasterYiRBuff(this.action);
  }
}

export class MasterYiR extends Action<void, MasterYiRCast> {
  static readonly rname = "Highlander";
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