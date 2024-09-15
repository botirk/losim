import { Unit } from "./unit";
import { EnemyTargetAction, TargetCast } from "./unitAction";
import { DamageType } from "./unitInteraction";

export class AttackAction extends EnemyTargetAction {
  constructor(owner: Unit) {
    super("Attack", owner);
  }

  readonly minLevel: number = 0;
  readonly maxLevel: number = 0;
  readonly isCancelableByUser: boolean = true;

  get castTime() {
    return (1 / this.owner.as) * this.owner.attackAnimation * 1000;
  }
  get cooldownTime() {
    return (1 / this.owner.as) * 1000;
  }
  async cast(option: Unit) {
    return await new AttackCast(this, option).init();
  }
  calc(target: Unit) {
    return target.interaction.calcPercentDamageReduction({ value: this.owner.ad, src: this.owner, type: DamageType.PHYSIC }).value;
  }
}

export class AttackCast extends TargetCast {
  action: AttackAction;
  protected async onFinishCast() {
    this.option.interaction.takeDamage({ value: this.action.owner.ad, src: this.action.owner, type: DamageType.PHYSIC });
    this.action.procOnHitUnit(this.option);
  }
}