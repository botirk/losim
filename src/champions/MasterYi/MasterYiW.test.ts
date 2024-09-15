import { MasterYi } from "./MasterYi";
import { Simulation } from "../../simulation/simulation";
import { DamageType } from "../../unit/unitInteraction";
import { MasterYiW, MasterYiWCast } from "./MasterYiW";
import { actionAbilityHasteTest, actionCdrTest, selfActionLevelTest, selfActionManaTest, selfActionOnCast } from "../../unit/action/actionTest";

selfActionOnCast("MasterYi W", (sim) => new MasterYi().init(sim).action.w);

actionAbilityHasteTest("MasterYi W", (sim) => new MasterYi().init(sim).action.w);

actionCdrTest("MasterYi W", (sim) => new MasterYi().init(sim).action.w);

selfActionLevelTest(MasterYiW.wname, (sim) => new MasterYi().init(sim).action.w);

selfActionManaTest(MasterYiW.wname, (sim) => new MasterYi().init(sim).action.w);

test("MasterYi W NoLevel", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);

  yi1.action.w.cast();
  expect(yi1.action.w.currentCast).toBeUndefined();
  expect(yi1.currentCast.value).toBeUndefined();
});

test("MasterYi W just cast", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  
  yi1.action.w.level = 1;
  const prom = yi1.action.w.cast();
  expect(yi1.currentCast.value).toBeInstanceOf(MasterYiWCast);
  expect(yi1.currentCast.value?.remaining).toBe(4000);
  expect(yi1.action.w.remainingCooldown).toBe(9000);
  await prom;
  expect(sim.time).toBe(4000);
  expect(yi1.currentCast.value).toBeUndefined();
  expect(yi1.action.w.remainingCooldown).toBe(5000);
  expect(yi1.currentCast.value).toBeFalsy();
});

test("MasterYi W Damage Reduction", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  yi1.action.w.level = 1;

  yi1.action.w.cast();
  let amt = yi1.interaction.calcPercentDamageReduction({ value: 100, src: yi1, type: DamageType.PHYSIC }).value;
  expect(amt).toBeGreaterThan(1);
  expect(amt).toBeLessThan(10);
  
  await sim.waitFor(400);
  amt = yi1.interaction.calcPercentDamageReduction({ value: 100, src: yi1, type: DamageType.PHYSIC }).value;
  expect(amt).toBeGreaterThan(1);
  expect(amt).toBeLessThan(10);

  await sim.waitFor(600);
  amt = yi1.interaction.calcPercentDamageReduction({ value: 100, src: yi1, type: DamageType.PHYSIC }).value;
  expect(amt).toBeGreaterThan(20);
  expect(amt).toBeLessThan(50);

  await sim.waitFor(3100);
  amt = yi1.interaction.calcPercentDamageReduction({ value: 100, src: yi1, type: DamageType.PHYSIC }).value;
  expect(amt).toBeGreaterThan(65);
  expect(amt).toBeLessThan(100);
});

test("MasterYi W AA reset", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  yi1.action.w.level = 1;
  
  await yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.isCooldown).toBe(true);

  yi1.action.w.cast();
  expect(yi1.action.attack.isCooldown).toBe(false);
});

test("MasterYi W Healing", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  yi1.action.w.level = 1;
  yi1.health = 1;

  let health = yi1.health;
  yi1.action.w.cast();
  await sim.waitFor(600);
  expect(yi1.health).toBeGreaterThan(health + 25);
  health = yi1.health;

  // 1100
  await sim.waitFor(500);
  expect(yi1.health).toBeGreaterThan(health + 25);
  health = yi1.health;

  // 1600
  await sim.waitFor(500);
  expect(yi1.health).toBeGreaterThan(health + 25);
  health = yi1.health;

  // 2100
  await sim.waitFor(500);
  expect(yi1.health).toBeGreaterThan(health + 25);
  health = yi1.health;

  // 2600
  await sim.waitFor(500);
  expect(yi1.health).toBeGreaterThan(health + 25);
  health = yi1.health;

  // 3100
  await sim.waitFor(500);
  expect(yi1.health).toBeGreaterThan(health + 25);
  health = yi1.health;

  // 3600
  await sim.waitFor(500);
  expect(yi1.health).toBeGreaterThan(health + 25);
  health = yi1.health;

  // 4100
  await sim.waitFor(500);
  expect(yi1.health).toBeGreaterThan(health + 25);
  health = yi1.health;
});

test("MasterYi W Cancel", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  yi1.action.w.level = 1;

  yi1.action.w.cast();
  expect(yi1.action.w.currentCast).toBeTruthy();
  await yi1.action.w.currentCast?.cancel();
  expect(yi1.action.w.currentCast).toBeUndefined();

  await sim.waitFor(1);
  expect(yi1.action.w.remainingCooldown).toBe(8999);
  const dmg = yi1.interaction.calcPercentDamageReduction({ src: yi1, value: 100, type: DamageType.PHYSIC }).value;
  expect(dmg).toBeGreaterThan(70);
  expect(dmg).toBeLessThan(90);
});

test("MasterYi W Mana continuation", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  yi1.action.w.level = 1;

  yi1.mana = yi1.action.w.manaCost;
  expect(await yi1.action.w.cast()).toBe(false);

  expect(sim.time).toBe(500);
});