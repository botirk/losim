import { StackBuff } from "../../unit/buff";
import { Item } from "../../unit/equip";
import { Unit } from "../../unit/unit";
import { DamageType } from "../../unit/unitInteraction";

export const terminus: Item = {
  unique: true,
  type: "item",
  isFinished: true,
  name: "Terminus",
  bonusAs: 30,
  bonusAd: 40,
  apply: (unit) => {
    let next: "light" | "dark" = "light";

    unit.action.attack.onHitUnit((t, m) => {
      t.interaction.takeDamage({ src: unit, type: DamageType.MAGIC, value: 30 * m });
      const light = unit.buffNamed(TerminusLightBuff.lname);
      const dark = unit.buffNamed(TerminusDarkBuff.dname);
      if (next === "light") {
        if (!(light instanceof TerminusLightBuff)) {
          new TerminusLightBuff(unit)
        } else {
          light.stack();
        }
        if (dark) dark.remainingTime = TerminusDarkBuff.duration;
        next = "dark";
      } else {
        if (!(dark instanceof TerminusDarkBuff)) {
          new TerminusDarkBuff(unit)
        } else {
          dark.stack();
        }
        if (light) light.remainingTime = TerminusLightBuff.duration;
        next = "light";
      }
    });
  },
}

export class TerminusLightBuff extends StackBuff {
  static duration = 5000;
  static lname = terminus.name + " Light";
  static defense(level: number, stacks: number) {
    if (level < 11) return 3 * stacks;
    else if (level < 14) return 4 * stacks;
    else return 5 * stacks;
  }

  constructor(owner: Unit) {
    super(TerminusLightBuff.lname, owner, TerminusLightBuff.duration, true);
  }
  protected readonly maxStacks: number = 5;
  protected onGainStats(): void {
    const def = TerminusLightBuff.defense(this.owner.level, this.stacks);
    this.owner.bonusArmor += def;
    this.owner.bonusMr += def;
  }
  protected onLoseStats(): void {
    const def = TerminusLightBuff.defense(this.owner.level, this.stacks);
    this.owner.bonusArmor -= def;
    this.owner.bonusMr -= def;
  }
}

export class TerminusDarkBuff extends StackBuff {
  static duration = 5000;
  static dname = terminus.name + " Dark";
  static pen(stacks: number) {
    return 6 * stacks;
  }

  constructor(owner: Unit) {
    super(TerminusDarkBuff.dname, owner, TerminusDarkBuff.duration, true);
  }
  protected readonly maxStacks: number = 5;
  protected onGainStats(): void {
    const pen = TerminusDarkBuff.pen(this.stacks);
    this.owner.armorPenPercent += pen;
    this.owner.mrPenPercent += pen;
  }
  protected onLoseStats(): void {
    const pen = TerminusDarkBuff.pen(this.stacks);
    this.owner.armorPenPercent -= pen;
    this.owner.mrPenPercent -= pen;
  }
}