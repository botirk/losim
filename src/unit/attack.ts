import { Unit } from "./unit";
import { EnemyTargetAction, TargetCast } from "./action";
import { DamageType } from "./unitInteraction";

export class AttackAction extends EnemyTargetAction {
  constructor(owner: Unit) {
    super("Attack", owner);
    owner.onBonusASChange(() => {
      this.setCooldown(this.cooldownTime);
      if (this.currentCast) this.currentCast.waitFor = this.castTime;
    })
  }

  readonly minLevel: number = 0;
  readonly maxLevel: number = 0;
  readonly isCancelableByUser: boolean = true;
  readonly isCooldownFinishedOnInterrupt: boolean = true;

  get castTime() {
    return (1 / this.owner.as) * this.owner.attackAnimation * 1000;
  }
  get cooldownTime() {
    return (1 / this.owner.as) * 1000;
  }
  castable(option: Unit): boolean {
    return !this.owner.dead && option.targetable;
  }
  calc(target: Unit) {
    return target.interaction.calcPercentDamageReduction({ value: this.owner.ad, src: this.owner, type: DamageType.PHYSIC }).value;
  }
  async cast(option: Unit) {
    return await new AttackCast(this, option).init();
  }
}

export class AttackCast extends TargetCast {
  action: AttackAction;
  protected async onFinishCast() {
    this.option.interaction.takeDamage({ value: this.action.owner.ad, src: this.action.owner, type: DamageType.PHYSIC });
    this.action.procOnHitUnit(this.option);
  }

  async init() {
    if (this.action.currentCast) return this.action.currentCast.wait();
    if (!this.action.castable(this.option)) return false;

    if (this.action.isCooldown) {
      const result = await Promise.any([ this.action.waitCooldown(), this.option.onTargetablePromise().then(() => false), this.action.owner.onDeathPromise().then(() => false), this.action.owner.onCurrentCastPromise(this).then(() => false) ]);
      if (result === false) return false;
    }
    
    return await super.init();
  }
}