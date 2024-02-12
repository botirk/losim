import { MasterYi } from "../../champions/MasterYi";
import { Simulation } from "../../simulation/simulation";
import { DamageType } from "../../unit/unitInteraction";
import { kraken } from "./kraken";

test("kraken basic", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  yi1.action.passive.disabled = true;
  expect(yi1.applyEquip(kraken)).toBe(true);
  const yi2 = new MasterYi().init(sim);
  yi2.bonusArmor = 0;
  yi2.health = 10000;

  let count = 0;
  yi2.interaction.onTakeDamage((e) => {
    if (e.type === DamageType.PHYSIC && e.value > 0) count += 1;
  });

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(count).toBe(2);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(count).toBe(4);
});

test("kraken advanced", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  yi1.action.passive.disabled = true;
  expect(yi1.applyEquip(kraken)).toBe(true);
  yi1.crit = 0;
  const yi2 = new MasterYi().init(sim);
  yi2.bonusArmor = 0;
  yi2.health = 10000;

  const damage = {};
  yi2.interaction.onTakeDamage((e) => {
    if (e.type === DamageType.PHYSIC && e.value > 0) damage[e.value.toFixed(2)] = true;
  });

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(Object.values(damage).length).toBe(1);
  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(Object.values(damage).length).toBe(2);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(Object.values(damage).length).toBe(2);
  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(Object.values(damage).length).toBe(2);
  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(Object.values(damage).length).toBe(3);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(Object.values(damage).length).toBe(3);
  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(Object.values(damage).length).toBe(4);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(Object.values(damage).length).toBe(4);
  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(Object.values(damage).length).toBe(4);
});