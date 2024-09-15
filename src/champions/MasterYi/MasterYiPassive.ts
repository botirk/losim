import { StackBuff, TimedBuff } from "../../unit/buff";
import { Unit } from "../../unit/unit";
import { DamageType } from "../../unit/unitInteraction";

export class MasterYiPassive {
  static readonly pname = "Double Strike";
  static readonly duration = 4000;

  disabled = false;
  constructor(private readonly owner: Unit) { }

  init(): this {
    this.owner.action.attack.onCast((target) => {
      if (this.disabled) return;
      const buff = this.buff;
      if (buff) {
        buff.stack();
        if (buff.isMaxStacks) {
          buff.fade();
          target.interaction.takeDamage({ value: this.owner.ad * 0.5, src: this.owner, type: DamageType.PHYSIC });
          this.owner.action.attack.procOnHitUnit(target);
          this.owner.action.attack.procOnCast(target);
        }
      } else {
        new MasterYiPassiveBuff(this.owner);
      }
    });
    return this;
  }

  get buff() {
    return this.owner.buffNamed(MasterYiPassive.pname) as (MasterYiPassiveBuff | undefined);
  }
}

export class MasterYiPassiveBuff extends StackBuff {
  constructor(unit: Unit) {
    super(MasterYiPassive.pname, unit, MasterYiPassive.duration, true);
  }

  protected maxStacks = 3;
}
