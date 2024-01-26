import { MasterYi } from "./MasterYi";
import { Simulation } from "../../simulation/simulation";
import { MasterYiR, MasterYiRBuff } from "./MasterYiR";
import { DamageType } from "../../unit/unitInteraction";
import { selfActionLevelTest, selfActionManaTest } from "../../unit/action/actionTest";

selfActionLevelTest(MasterYiR.rname, (sim) => new MasterYi().init(sim).action.r);

selfActionManaTest(MasterYiR.rname, (sim) => new MasterYi().init(sim).action.r);

test("MasterYi R unleveled", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.buffs).toHaveLength(0);
  expect(yi2.buffs).toHaveLength(0);
  expect(yi1.action.r.isCancelableByUser).toBe(false);
  yi1.action.r.cast();
  expect(yi1.action.r.currentCast).toBeUndefined();
  expect(yi1.action.r.isCooldown).toBe(false);
  expect(yi1.buffs).toHaveLength(0);
  expect(yi1.bonusAs.value).toBe(0);
});

test("MasterYi R levels(as)", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);

  yi1.action.r.level = 1;
  expect(await yi1.action.r.cast()).toBe(true);
  expect(yi1.buffs).toHaveLength(1);
  expect(yi1.bonusAs.value).toBe(25);

  yi1.mana = yi1.maxMana;
  await yi1.action.r.waitCooldown();
  expect(yi1.bonusAs.value).toBe(0);
  yi1.action.r.level = 2;
  expect(await yi1.action.r.cast()).toBe(true);
  expect(yi1.buffs).toHaveLength(1);
  expect(yi1.bonusAs.value).toBe(35);

  yi1.mana = yi1.maxMana;
  await yi1.action.r.waitCooldown();
  expect(yi1.bonusAs.value).toBe(0);
  yi1.action.r.level = 3;
  expect(await yi1.action.r.cast()).toBe(true);
  expect(yi1.buffs).toHaveLength(1);
  expect(yi1.bonusAs.value).toBe(45);

  yi1.mana = yi1.maxMana;
  await yi1.action.r.waitCooldown();
  expect(yi1.bonusAs.value).toBe(0);
  yi1.action.r.level = 5;
  expect(await yi1.action.r.cast()).toBe(true);
  expect(yi1.buffs).toHaveLength(1);
  expect(yi1.bonusAs.value).toBe(45);

  await yi1.action.r.waitCooldown();
  expect(yi1.bonusAs.value).toBe(0);
});

test("MasterYi R Buff", async () => {
  const sim = new Simulation().start(10000);
  const yi1 = new MasterYi().init(sim);
  expect(yi1.buffs).toHaveLength(0);
  yi1.action.r.level = 1;
  expect(yi1.buffs).toHaveLength(0);
  yi1.action.r.cast();
  expect(yi1.buffNamed(MasterYiR.rname)).toBeInstanceOf(MasterYiRBuff);
  await sim.waitFor(6999);
  expect(yi1.buffs).toHaveLength(1);
  await sim.waitFor(2);
  expect(yi1.buffs).toHaveLength(0);
});

test("MasterYi R Cd", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  yi1.action.r.level = 1;
  expect(yi1.action.r.isCooldown).toBe(false);
  expect(yi1.action.r.remainingCooldown).toBe(0);
  yi1.action.r.cast();
  expect(yi1.action.r.remainingCooldown).toBe(85000);
  await sim.waitFor(42500);
  expect(yi1.action.r.remainingCooldown).toBe(42500);
  expect(yi1.action.r.isCooldown).toBe(true);
  await sim.waitFor(42501);
  expect(yi1.action.r.isCooldown).toBe(false);
  expect(yi1.action.r.remainingCooldown).toBe(0);
});

test("MasterYi R Takedown", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  const yi3 = new MasterYi().init(sim);
  
  yi1.action.r.level = 1;
  
  await yi1.action.attack.cast(yi2);
  await sim.waitFor(10001);
  yi1.action.r.cast();
  expect(yi1.buffNamed(MasterYiR.rname)?.remainingTime).toBe(7000);
  yi2.interaction.takeDamage({ value: Infinity, src: yi2, type: DamageType.TRUE });
  expect(yi1.buffNamed(MasterYiR.rname)?.remainingTime).toBe(7000);

  await yi1.action.attack.cast(yi3);
  expect(yi1.buffNamed(MasterYiR.rname)?.isActive).toBe(true);
  const time = yi1.buffsNamed(MasterYiR.rname)[0].remainingTime;
  yi3.interaction.takeDamage({ value: Infinity, src: yi3, type: DamageType.TRUE });
  expect(yi1.buffNamed(MasterYiR.rname)?.remainingTime).toBe(time + 7000);
});