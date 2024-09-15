import { StackBuff } from "../../unit/buff";
import { Item } from "../../unit/equip";
import { Unit } from "../../unit/unit";

export class PDancerBuff extends StackBuff {
  static duration = 3000;
  static as(stacks: number) {
    return stacks * 7;
  }

  constructor(owner: Unit) {
    super(pdancer.name, owner, PDancerBuff.duration, true);
  }

  protected onGainStats(): void {
    this.owner.bonusAs.value += PDancerBuff.as(this.stacks);
  }

  protected onLoseStats(): void {
    this.owner.bonusAs.value -= PDancerBuff.as(this.stacks);
  }

  protected readonly maxStacks: number = 5;
}

export const pdancer: Item = {
  type: "item",
  unique: true,
  name: "Phantom Dancer",
  isFinished: true,
  bonusAd: 20,
  bonusAs: 30,
  crit: 20,
  mMs: 1.1,
  apply: (unit) => {
    unit.action.attack.onCast(() => {
      const buff = unit.buffNamed(pdancer.name);
      if (!(buff instanceof PDancerBuff)) {
        new PDancerBuff(unit);
      } else {
        buff.stack();
      }
    })
  },
}