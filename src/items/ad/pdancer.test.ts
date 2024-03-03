import { MasterYi } from "../../champions/MasterYi/MasterYi";
import { Simulation } from "../../simulation/simulation";
import { PDancerBuff, pdancer } from "./pdancer";


test("Experimental Hexplate", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  yi1.action.passive.disabled = true;
  expect(yi1.applyEquip(pdancer)).toBe(true);
  expect(yi1.bonusAs.value).toBe(30);
  const yi2 = new MasterYi().init(sim);
  yi2.health = 10000;

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.bonusAs.value).toBe(30 + PDancerBuff.as(1));

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.bonusAs.value).toBe(30 + PDancerBuff.as(2));

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.bonusAs.value).toBe(30 + PDancerBuff.as(3));

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.bonusAs.value).toBe(30 + PDancerBuff.as(4));

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.bonusAs.value).toBe(30 + PDancerBuff.as(5));

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.bonusAs.value).toBe(30 + PDancerBuff.as(5));

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.bonusAs.value).toBe(30 + PDancerBuff.as(5));

  await sim.waitFor(3001);
  expect(yi1.bonusAs.value).toBe(30);
});