import { Simulation } from "../../simulation/simulation";
import { MasterYi } from "../../champions/MasterYi/index";
import { botrk } from "./botrk";
import { DamageType } from "../../unit/unitInteraction";

test("botrk", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  yi2.bonusArmor = 0;
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