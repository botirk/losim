import { Unit } from "../../unit/unit";
import { Action, SelfCast } from "../../unit/action";
import { DamageType } from "../../unit/unitInteraction";

export class MasterYiWCast extends SelfCast {
  protected async onStartCast() {
    this.action.owner.action.attack.finishCooldown();
    const cancelDR = this.action.owner.interaction.percentDamageReduction((e) => {
      if (e.type === DamageType.TRUE) return;
      else if (time < 500) e.value *= 0.1;
      else e.value *= (100 - MasterYiW.dr(this.action.level)) / 100;
    });
    let time = 0;
    for (; time <= this.action.castTime; time += 500) {
      const result = await Promise.any([ this.wait(), this.action.owner.sim.waitFor(500) ]);
      if (result) {
        this.action.owner.interaction.takeHeal({ src: this.action.owner, value: MasterYiW.tickHeal(this.action.level, this.action.owner) });
      } else {
        break;
      }
    }
    cancelDR();
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
  readonly isCooldownFinishedOnInterrupt: boolean = false;

  get castTime(): number {
    if (this.level === 0) return 0;
    return 4000;
  }
  get cooldownTime(): number {
    if (this.level === 0) return 0;
    return 9000;
  }

  static dr(level: number) {
    if (level <= 0) return 0;
    return 42.5 + level * 2.5;
  }
  static tickHeal(level: number, owner: Unit) {
    if (level <= 0) return 0;
    return (5 + level * 10) * (2 - owner.health / owner.maxHealth);
  }

  async cast() {
    return await new MasterYiWCast(this).init();
  }
}