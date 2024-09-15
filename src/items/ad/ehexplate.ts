import { TimedBuff } from "../../unit/buff";
import { Unit } from "../../unit/unit";
import { Item } from "../../unit/equip";

export class EHexplateBuff extends TimedBuff {
  constructor(owner: Unit) {
    super(ehexplate.name, owner, 8000, true);
    owner.mMs *= 1.15;
    owner.bonusAs.value += 35;
  }

  fade(): void {
    if (!this.isActive) return;
    this.owner.mMs /= 1.15;
    this.owner.bonusAs.value -= 35;
    super.fade();
  }
}

export const ehexplate: Item = {
  type: "item",
  unique: true,
  name: "Experimental Hexplate",
  isFinished: true,
  bonusAd: 55,
  bonusAs: 25,
  maxHealth: 300,
  apply: (unit) => {
    const ult = unit.action.r;
    if (ult && ult.maxLevel !== unit.action.q?.maxLevel) {
      ult.abilityHaste += 30;
      let lastActivation = -Infinity;
      ult.onCast(() => {
        if (lastActivation + 30000 <= unit.sim.time) {
          lastActivation = unit.sim.time;
          new EHexplateBuff(unit);
        }
      });
    }
  },
}
