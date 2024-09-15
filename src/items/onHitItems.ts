import { MasterYi } from "../champions/MasterYi/MasterYi";
import { Simulation } from "../simulation/simulation";
import { TimedSlow } from "../unit/buff";
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

      expect(yi2.slow).toBe(30);
      expect(yi2.ms).toBeLessThan(300);

      await sim.waitFor(1001);
      expect(yi2.slow).toBe(0);
      expect(yi2.ms).toBeGreaterThan(300);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(yi2.slow).toBe(0);
      expect(yi2.ms).toBeGreaterThan(300);

      await sim.waitFor(15000 - 1001 - yi1.action.attack.castTime * 2);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(yi2.slow).toBe(30);
      expect(yi2.ms).toBeLessThan(300);
    });
  },
}

export const onHitItems: Equip[] = [
  botrk,
]