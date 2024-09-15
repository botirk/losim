import { MasterYi } from "../../champions/MasterYi/MasterYi";
import { Simulation } from "../../simulation/simulation";
import { StackBuff } from "../../unit/buff";
import { LTempoBuff, ltempo } from "./ltempo";


test("Lethal tempo", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  yi1.action.passive.disabled = true;
  expect(yi1.applyEquip(ltempo)).toBe(true);
  expect(yi1.applyEquip(ltempo)).toBe(false);
  const yi2 = new MasterYi().init(sim);
  yi2.health = 10000;

  const cap = yi1.asCap;
  const range = yi1.attackRange;
  expect(yi1.bonusAs.value).toBe(0);
  

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.bonusAs.value).toBe(LTempoBuff.as(true, 1, 1));
  expect(yi1.attackRange).toBe(range + LTempoBuff.range(1));
  expect(yi1.asCap).toBe(cap);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.bonusAs.value).toBe(LTempoBuff.as(true, 1, 2));
  expect(yi1.attackRange).toBe(range + LTempoBuff.range(2));
  expect(yi1.asCap).toBe(cap);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.bonusAs.value).toBe(LTempoBuff.as(true, 1, 3));
  expect(yi1.attackRange).toBe(range + LTempoBuff.range(3));
  expect(yi1.asCap).toBe(cap);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.bonusAs.value).toBe(LTempoBuff.as(true, 1, 4));
  expect(yi1.attackRange).toBe(range + LTempoBuff.range(4));
  expect(yi1.asCap).toBe(cap);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.bonusAs.value).toBe(LTempoBuff.as(true, 1, 5));
  expect(yi1.attackRange).toBe(range + LTempoBuff.range(5));
  expect(yi1.asCap).toBe(cap);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.bonusAs.value).toBe(LTempoBuff.as(true, 1, 6));
  expect(yi1.attackRange).toBe(range + LTempoBuff.range(6));
  expect(yi1.asCap).toBeGreaterThan(cap);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.bonusAs.value).toBe(LTempoBuff.as(true, 1, 6));
  expect(yi1.attackRange).toBe(range + LTempoBuff.range(6));
  expect(yi1.asCap).toBeGreaterThan(cap);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.bonusAs.value).toBe(LTempoBuff.as(true, 1, 6));
  expect(yi1.attackRange).toBe(range + LTempoBuff.range(6));
  expect(yi1.asCap).toBeGreaterThan(cap);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.bonusAs.value).toBe(LTempoBuff.as(true, 1, 6));
  expect(yi1.attackRange).toBe(range + LTempoBuff.range(6));
  expect(yi1.asCap).toBeGreaterThan(cap);

  await sim.waitFor(6001);
  expect((yi1.buffNamed(ltempo.name) as StackBuff).stacks).toBe(5);
  expect(yi1.bonusAs.value).toBe(LTempoBuff.as(true, 1, 5));
  expect(yi1.attackRange).toBe(range + LTempoBuff.range(5));
  expect(yi1.asCap).toBe(cap);

  await sim.waitFor(500);
  expect((yi1.buffNamed(ltempo.name) as StackBuff).stacks).toBe(4);
  expect(yi1.bonusAs.value).toBe(LTempoBuff.as(true, 1, 4));
  expect(yi1.attackRange).toBe(range + LTempoBuff.range(4));
  expect(yi1.asCap).toBe(cap);

  await sim.waitFor(500);
  expect((yi1.buffNamed(ltempo.name) as StackBuff).stacks).toBe(3);
  expect(yi1.bonusAs.value).toBe(LTempoBuff.as(true, 1, 3));
  expect(yi1.attackRange).toBe(range + LTempoBuff.range(3));
  expect(yi1.asCap).toBe(cap);

  await sim.waitFor(500);
  expect((yi1.buffNamed(ltempo.name) as StackBuff).stacks).toBe(2);
  expect(yi1.bonusAs.value).toBe(LTempoBuff.as(true, 1, 2));
  expect(yi1.attackRange).toBe(range + LTempoBuff.range(2));
  expect(yi1.asCap).toBe(cap);

  await sim.waitFor(500);
  expect((yi1.buffNamed(ltempo.name) as StackBuff).stacks).toBe(1);
  expect(yi1.bonusAs.value).toBe(LTempoBuff.as(true, 1, 1));
  expect(yi1.attackRange).toBe(range + LTempoBuff.range(1));
  expect(yi1.asCap).toBe(cap);

  await sim.waitFor(500);
  expect((yi1.buffNamed(ltempo.name))).toBeFalsy();
  expect(yi1.bonusAs.value).toBe(0);
  expect(yi1.attackRange).toBe(range);
  expect(yi1.asCap).toBe(cap);
});