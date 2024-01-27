import { Equip } from "../unit/equip";

export const botrk: Equip = {
  type: "finishedItem",
  name: "Blade of the Ruined King",
  bonusAd: 40,
  bonusAs: 25,
  lifesteal: 8,
  apply: (unit) => {
    unit.action.attack.onHitUnit((t, m) => {
      const damage = (unit.isMelee ? 0.12 * t.health : 0.09 * t.health);
      const result = 0;
    });
  }
}

export const onHitItems: Equip[] = [
  botrk,
]