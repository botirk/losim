import { Unit } from "../../unit/unit";
import { Action, SelfCast } from "../../unit/unitAction";

export class MasterYiWCast extends SelfCast {
  protected async onStartCast() {
    /*this.unit.action.attack.finishCooldown();
    const cancelDR = this.unit.interaction.percentDamageReduction((e) => {
      if (e.type === DamageType.TRUE) return;
      else if (time < 500) e.value *= 0.1;
      else e.value *= (100 - this.dr) / 100;
    });
    let time = 0;
    for (; time <= this.castTime; time += 500) {
      const result = await Promise.any([this.waitForCast(), this.unit.sim.waitFor(500), this.castInterruptPromise()]);
      if (result) {
        this.unit.interaction.takeHeal({ src: this.unit, value: this.tickHeal });
      } else {
        break;
      }
    }
    cancelDR();*/
  }
}

export class MasterYiW extends Action<void> {
  constructor(unit: Unit) {
    super(MasterYiW.wname, unit);
  }

  static readonly wname = "Meditate";
  readonly maxLevel: number = 5;
  readonly minLevel: number = 1;
  readonly isCancelableByUser: boolean = true;

  get castTime(): number {
    if (this.level === 0) return 0;
    return 4000;
  }
  get cooldownTime(): number {
    if (this.level === 0) return 0;
    return 9000;
  }

  get dr() {
    if (this.level === 0) return 0;
    return 42.5 + this.level * 2.5;
  }
  get tickHeal() {
    if (this.level === 0) return 0;
    return (5 + this.level * 10) * (2 - this.owner.health / this.owner.maxHealth);
  }

  async cast() {
    return await new MasterYiWCast(this).init();
  }
}