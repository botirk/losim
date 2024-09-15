import { TimedSlow } from "../../unit/buff";
import { Item } from "../../unit/equip";
import { Unit } from "../../unit/unit";
import { DamageType } from "../../unit/unitInteraction";

export const botrkDamage = (src: Unit, target: Unit) => {
  return (src.isMelee ? 0.12 * target.health : 0.09 * target.health);
}

export const botrk: Item = {
  unique: true,
  type: "item",
  isFinished: true,
  name: "Blade of the Ruined King",
  bonusAd: 40,
  bonusAs: 25,
  lifesteal: 8,
  apply: (unit) => {
    let lastActivation = -Infinity;
    unit.action.attack.onHitUnit((t, m) => {
      const result = t.interaction.takeDamage({ src: unit, type: DamageType.PHYSIC, value: botrkDamage(unit, t) * m }).value;
      if (unit.lifesteal > 0) unit.interaction.takeHeal({ value: result * (unit.lifesteal / 100), src: unit });
      if (lastActivation + 15000 <= unit.sim.time) {
        lastActivation = unit.sim.time;
        new TimedSlow(botrk.name, t, 1000, unit, 30);
      }
    });
  },
}