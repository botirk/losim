import { TimedBuff } from "../../unit/buff";
import { Item } from "../../unit/equip";
import { Unit } from "../../unit/unit";

export class GangelBuff extends TimedBuff {
  static duration = 4000;
  constructor(owner: Unit) {
    super(gangel.name, owner, 4000, true);
    owner.isStunned.value = true;
    this.cancelDR = owner.interaction.finalDamageReduction(e => {
      e.value = owner.health - 1;
    });
  }

  private cancelDR: () => void;

  fade(): void {
    this.owner.isStunned.value = false;
    this.cancelDR();
    this.owner.health = this.owner.baseMaxHealth / 2;
    this.owner.mana = this.owner.maxMana;
    super.fade();
  }
}

export const gangel: Item = {
  type: "item",
  unique: true,
  name: "Guardian Angel",
  isFinished: true,
  bonusAd: 55,
  armor: 45,
  apply: (unit) => {
    let cooldownTime = -Infinity;
    unit.interaction.finalDamageReduction(e => {
      if (unit.dead.value) return;
      else if (cooldownTime > unit.sim.time) return;
      else if (unit.buffNamed(gangel.name)) return;
      else if (unit.health - e.value <= 0) new GangelBuff(unit);
    });
  },
}