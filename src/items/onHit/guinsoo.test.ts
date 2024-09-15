import { MasterYi } from "../../champions/MasterYi/index";
import { Simulation } from "../../simulation/simulation";
import { DamageType } from "../../unit/unitInteraction";
import { GuinsooBuff, GuinsooPhantomBuff, guinsoo } from "./guinsoo";

test("guinso basic", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  expect(yi1.applyEquip(guinsoo)).toBe(true);
  const yi2 = new MasterYi().init(sim);
  yi2.bonusMr = 0;

  let magic = 0;
  yi2.interaction.onTakeDamage((e) => {
    if (e.src === yi1 && e.type === DamageType.MAGIC && e.value == 30) magic += 1;
  });
  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(magic).toBe(1);
});

test("guinso", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  yi1.action.passive.disabled = true;
  expect(yi1.applyEquip(guinsoo)).toBe(true);
  const yi2 = new MasterYi().init(sim);
  yi2.health = 10000;
  
  let count = 0;
  yi1.action.attack.onHitUnit(() => count += 1);

  expect(yi1.bonusAs.value).toBe(25);
  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(count).toBe(1);
  expect(yi1.bonusAs.value).toBe(25 + 8);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(count).toBe(2);
  expect(yi1.bonusAs.value).toBe(25 + 8 * 2);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(count).toBe(3);
  expect(yi1.bonusAs.value).toBe(25 + 8 * 3);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(count).toBe(4);
  expect(yi1.bonusAs.value).toBe(25 + 8 * 4);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(count).toBe(5);
  expect(yi1.bonusAs.value).toBe(25 + 8 * 4);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(count).toBe(6);
  expect(yi1.bonusAs.value).toBe(25 + 8 * 4);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(count).toBe(7);
  expect(yi1.bonusAs.value).toBe(25 + 8 * 4);

  await sim.waitFor(150 + 1);
  expect(count).toBe(8);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(count).toBe(9);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(count).toBe(10);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(count).toBe(11);

  await sim.waitFor(150 + 1);
  expect(count).toBe(12);

  await sim.waitFor(GuinsooPhantomBuff.duration + 1);
  expect(yi1.buffNamed(GuinsooPhantomBuff.pname)).toBeUndefined();

  await sim.waitFor(GuinsooBuff.duration - GuinsooPhantomBuff.duration);
  expect(yi1.bonusAs.value).toBe(25);
  expect(yi1.buffNamed(guinsoo.name)).toBeUndefined();
  
});