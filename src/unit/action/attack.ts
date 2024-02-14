import { Unit } from "../unit";
import { EnemyTargetAction, TargetCast } from "./action";
import { DamageType } from "../unitInteraction";
import seedrandom from "seedrandom";

export class AttackAction extends EnemyTargetAction<AttackCast> {
  constructor(owner: Unit) {
    super("Attack", owner);
    owner.bonusAs.callback(() => {
      this.setCooldown(this.cooldownTime);
      if (this.currentCast) this.currentCast.waitFor = this.castTime;
    });
  }

  readonly minLevel: number = 0;
  readonly maxLevel: number = 0;
  readonly isCancelableByUser: boolean = true;
  readonly isCooldownFinishedOnInterrupt: boolean = true;
  readonly isUltimate: boolean = false;

  get maxRange(): number {
    return this.owner.attackRange;
  }

  get castTime() {
    return (1 / this.owner.as) * this.owner.attackAnimation * 1000;
  }
  get cooldownTime() {
    return (1 / this.owner.as) * 1000;
  }
  castable(option: Unit): boolean {
    return !this.owner.dead.value && option.targetable.value && Math.abs(this.owner.pos - option.pos) < this.maxRange && this.owner.isEnemy(option);
  }
  calc(target: Unit) {
    return target.interaction.calcDamageReduction({ value: this.owner.ad, src: this.owner, type: DamageType.PHYSIC }).value;
  }
  random = seedrandom();
  async cast(option: Unit) {
    return await new AttackCast(this, option, this.random).init();
  }
}

export class AttackCast extends TargetCast<AttackAction> {
  constructor(action: AttackAction, option: Unit, private readonly random: seedrandom.PRNG) {
    super(action, option);
  }

  declare action: AttackAction;

  protected async onFinishCast() {
    const isCrit = (Math.max(0, Math.min(100, this.action.owner.crit)) >= this.random() * 100);
    const value = isCrit ? this.action.owner.ad * (1.75 + this.action.owner.bonusCritDamage / 100) : this.action.owner.ad;
    this.action.procOnHitUnit(this.option);
    const result = this.option.interaction.takeDamage({ value, src: this.action.owner, type: DamageType.PHYSIC, isCrit });
    if (this.action.owner.lifesteal > 0) this.action.owner.interaction.takeHeal({ src: this.action.owner, value: result.value * (this.action.owner.lifesteal / 100) });
  }

  async init() {
    if (this.action.currentCast) return this.action.currentCast.wait();
    if (!this.action.castable(this.option)) return false;

    if (this.action.isCooldown) {
      const result = await Promise.any([ 
        this.action.waitCooldown(), 
        this.option.targetable.promise(this.action.waitCooldown(), false).then(() => false), 
        this.action.owner.dead.promise(this.action.waitCooldown(), true).then(() => false), 
        this.action.owner.currentCast.promise(this.action.waitCooldown(), (cast) => cast !== this).then(() => false) 
      ]);
      if (result === false) return false;
    }
    
    return await super.init();
  }
}