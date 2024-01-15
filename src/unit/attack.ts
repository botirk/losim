import { EnemyTargetAction, TargetCast, UnitAction } from "./unitAction";
import { DamageType } from "./unitInteraction";

export class AttackAction extends EnemyTargetAction {
  minLevel: number = 0;
  maxLevel: number = 0;

  get castTime() {
    return (1 / this.unit.as) * this.unit.attackAnimation * 1000;
  }
  get cooldownTime() {
    return (1 / this.unit.as) * 1000;
  }
}

export class AttackCast extends TargetCast {
  isCancelableByUser: boolean = true;

  action: AttackAction;
  protected async onFinishCast() {
    this.option.interaction.takeDamage({ value: this.action.unit.ad, src: this.action.unit, type: DamageType.PHYSIC });
    this.action.procOnHitUnit(this.option);
  }
}