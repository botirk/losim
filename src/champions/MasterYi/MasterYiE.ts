import { SelfCast, Action } from "../../unit/action/action";
import { TimedBuff } from "../../unit/buff";
import { Unit } from "../../unit/unit";
import { DamageType } from "../../unit/unitInteraction";

export class MasterYiEBuff extends TimedBuff {
  constructor(action: MasterYiE) {
    super(MasterYiE.ename, action.owner, action.level ? 5000 : 0, true, action);
    if (!this.action.level) return;
    this.removeOnHit = action.owner.action.attack.onHitUnit((target, m) => {
      target.interaction.takeDamage({ value: MasterYiE.damage(action.owner, this.action.level) * m, src: this.owner, type: DamageType.TRUE });
    });
  }
  private removeOnHit?: () => void;
  fade(): void {
    super.fade();
    this.removeOnHit?.();
  }
}

export class MasterYiECast extends SelfCast<MasterYiE> {
  protected async onFinishCast() {
    new MasterYiEBuff(this.action);
  }
}

export class MasterYiE extends Action<void, MasterYiECast> {
  static readonly ename = "Wuju Style";
  static damage(src: Unit, level: number) {
    if (level <= 0) return 0;
    return 25+level*5 + src.bonusAd * 0.3;
  }
  
  constructor(unit: Unit) {
    super(MasterYiE.ename, unit);
  }
  
  readonly maxLevel: number = 5;
  readonly minLevel: number = 1;
  readonly isCancelableByUser: boolean = false;
  readonly isCooldownFinishedOnInterrupt: boolean = false;
  readonly isUltimate: boolean = false;

  get castTime(): number {
    return 0;
  }
  get cooldownTime(): number {
    if (this.level === 0) return 0;
    return 14000 * this.owner.abilityHasteModifier;
  }
  
  async cast() {
    return new MasterYiECast(this).init();
  }
}