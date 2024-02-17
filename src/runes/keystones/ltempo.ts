import { Champion } from "../../champions/champion/champion";
import { StackBuff } from "../../unit/buff";
import { Keystone } from "../../unit/equip";
import { Unit } from "../../unit/unit";

export class LTempoBuff extends StackBuff {
  static as(isMelee: boolean, level: number, stacks: number) {
    const base = isMelee ? 9 : 3.6;
    const perLevel = isMelee ? 4.5 / 17 : 4.4 / 17;
    return base + perLevel * (level - 1);
  }
  static range(stacks: number) {
    return stacks < 6 ? 0 : 50;
  }
  static asCap(stacks: number) {
    return stacks < 6 ? 0 : 7.5;
  }
  static duration = 6000;
  static fadeDuration = 500;

  constructor(owner: Unit, fadingStacks?: number) {
    super(ltempo.name, owner, fadingStacks ? LTempoBuff.fadeDuration : LTempoBuff.duration, true);
    for (let i = 1; i < (fadingStacks || 0); i += 1) this.stack();
  }
  protected maxStacks = 6;
  protected onGainStats(): void {
    this.owner.asCap += LTempoBuff.asCap(this.stacks);
    this.owner.attackRange += LTempoBuff.range(this.stacks);
    this.owner.bonusAs.value += LTempoBuff.as(this.owner.isMelee, this.owner.level, this.stacks);
  }
  protected onLoseStats(): void {
    this.owner.asCap -= LTempoBuff.asCap(this.stacks);
    this.owner.attackRange -= LTempoBuff.range(this.stacks);
    this.owner.bonusAs.value -= LTempoBuff.as(this.owner.isMelee, this.owner.level, this.stacks);
  }
  

  fade(): void {
    super.fade();
    if (this.stacks > 1) new LTempoBuff(this.owner, this.stacks - 1);
  }
}

export const ltempo: Keystone = {
  name: "Lethal Tempo",
  path: "Precision",
  subtype: "Keystone",
  type: "rune",
  apply: (unit) => {
    unit.action.attack.onHitUnit((t) => {
      if (!(t instanceof Champion)) return;
      const buff = unit.buffNamed(ltempo.name);
      if (!(buff instanceof LTempoBuff)) {
        new LTempoBuff(unit);
      } else {
        buff.stack();
      }
    })
  },
}