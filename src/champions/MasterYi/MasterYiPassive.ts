import { TimedBuff } from "../../unit/buff";
import { Unit } from "../../unit/unit";
import { DamageType } from "../../unit/unitInteraction";

export class MasterYiPassive {
  static readonly pname = "Double Strike";

  constructor(private readonly owner: Unit) { }

  init(): this {
    this.owner.action.attack.onHitUnit((target) => {
      const buff = this.buff;
      if (buff) {
        buff.stacks += 1;
        buff.remainingTime = 4000;
        if (buff.stacks >= 3) {
          buff.stacks = 0;
          target.interaction.takeDamage({ value: this.owner.ad * 0.5, src: this.owner, type: DamageType.PHYSIC });
          this.owner.action.attack.procOnHitUnit(target);
        }
      } else {
        new MasterYiPassiveBuff(this.owner);
      }
    });
    return this;
  }

  get buff() {
    return this.owner.buffsNamed(MasterYiPassive.pname)[0] as (MasterYiPassiveBuff | undefined);
  }
}

export class MasterYiPassiveBuff extends TimedBuff {
  stacks = 1;
  constructor(unit: Unit) {
    super(MasterYiPassive.pname, unit, 4000);
  }
  fade(): void {
    super.fade();
  }
}
