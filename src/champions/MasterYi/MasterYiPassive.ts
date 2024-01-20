import { TimedBuff } from "../../unit/buff";
import { Unit } from "../../unit/unit";
import { DamageType } from "../../unit/unitInteraction";

export class MasterYiPassive {
  static readonly pname = "Double Strike";

  disabled = false;
  constructor(private readonly owner: Unit) { }

  init(): this {
    this.owner.action.attack.onCast((target) => {
      if (this.disabled) return;
      const buff = this.buff;
      if (buff) {
        buff.stacks += 1;
        buff.remainingTime = 4000;
        if (buff.stacks >= 3) {
          buff.stacks = 0;
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

export class MasterYiPassiveBuff extends TimedBuff {
  constructor(unit: Unit) {
    super(MasterYiPassive.pname, unit, 4000, true);
  }
  
  stacks = 1;
  fade(): void {
    super.fade();
  }
}
