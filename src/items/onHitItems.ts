import { MasterYi } from "../champions/MasterYi/MasterYi";
import { Simulation } from "../simulation/simulation";
import { Equip } from "../unit/equip";
import { Unit } from "../unit/unit";
import { DamageType } from "../unit/unitInteraction";

export const botrkDamage = (src: Unit, target: Unit) => {
  return (src.isMelee ? 0.12 * target.health : 0.09 * target.health);
}

export const botrk: Equip = {
  type: "finishedItem",
  name: "Blade of the Ruined King",
  bonusAd: 40,
  bonusAs: 25,
  lifesteal: 8,
  // TODO: apply slow
  apply: (unit) => {
    unit.action.attack.onHitUnit((t, m) => {
      const result = t.interaction.takeDamage({ src: unit, type: DamageType.PHYSIC, value: botrkDamage(unit, t) * m }).value;
      if (unit.lifesteal > 0) unit.interaction.takeHeal({ value: result * (unit.lifesteal / 100), src: unit });
    });
  },
  test: () => {
    test("botrk", async () => {
      const sim = new Simulation().start(500000);
      const yi1 = new MasterYi().init(sim);
      const yi2 = new MasterYi().init(sim);
      yi2.armor = 0;
      yi2.health = 1000;
      expect(yi1.applyEquip(botrk)).toBe(true);

      let botrkhits = 0;
      yi2.interaction.onTakeDamage((e) => {
        if (e.src === yi1 && e.type === DamageType.PHYSIC && e.value === 120) botrkhits += 1;
      });

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(botrkhits).toBe(1);
    });
  },
}

export const onHitItems: Equip[] = [
  botrk,
]