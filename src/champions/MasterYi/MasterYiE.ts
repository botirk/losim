import { SelfCast, Action } from "../../unit/action/action";
import { TimedBuff } from "../../unit/buff";
import { Unit } from "../../unit/unit";
import { DamageType } from "../../unit/unitInteraction";

export class MasterYiEBuff extends TimedBuff {
  private removeOnHit?: () => void;
  constructor(unit: Unit, readonly level: number) {
    level = Math.max(0, Math.min(5, level));
    super(MasterYiE.ename, unit, level ? 5000 : 0);
    if (!level) return;
    this.removeOnHit = unit.action.attack.onHitUnit((target, m) => {
      target.interaction.takeDamage({ value: MasterYiE.damage(unit, level) * m, src: unit, type: DamageType.TRUE });
    });
  }
  fade(): void {
    super.fade();
    this.removeOnHit?.();
  }
}

export class MasterYiECast extends SelfCast<MasterYiE> {
  protected async onFinishCast() {
    new MasterYiEBuff(this.action.owner, this.action.level);
  }
}

export class MasterYiE extends Action<void, MasterYiECast> {
  constructor(unit: Unit) {
    super(MasterYiE.ename, unit);
  }
  
  static readonly ename = "Wuju Style";
  readonly maxLevel: number = 5;
  readonly minLevel: number = 1;
  readonly isCancelableByUser: boolean = false;
  readonly isCooldownFinishedOnInterrupt: boolean = false;

  get castTime(): number {
    return 0;
  }
  get cooldownTime(): number {
    if (this.level === 0) return 0;
    return 14000;
  }
  static damage(src: Unit, level: number) {
    if (level <= 0) return 0;
    return 25+level*5 + src.bonusAd * 0.3;
  }
  async cast() {
    return new MasterYiECast(this).init();
  }
}