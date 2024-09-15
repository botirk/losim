import { MasterYi } from "./MasterYi";
import { Simulation } from "../../simulation/simulation";
import { MasterYiR } from "./MasterYiR";

test("MasterYi R unleveled", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.buffs).toHaveLength(0);
  expect(yi2.buffs).toHaveLength(0);
  expect(yi1.action.r.isCancelableByUser).toBe(false);
  yi1.action.r.cast();
  expect(yi1.action.r.isCasting).toBe(false);
  expect(yi1.action.r.isCooldown).toBe(false);
  expect(yi1.buffs).toHaveLength(0);
  expect(yi1.bonusAs).toBe(0);
});

test("MasterYi R levels(as)", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);

  yi1.action.r.level = 1;
  await yi1.action.r.cast();
  expect(yi1.buffs).toHaveLength(1);
  expect(yi1.bonusAs).toBe(25);

  await yi1.action.r.waitForCooldown();
  expect(yi1.bonusAs).toBe(0);
  yi1.action.r.level = 2;
  await yi1.action.r.cast();
  expect(yi1.buffs).toHaveLength(1);
  expect(yi1.bonusAs).toBe(35);

  await yi1.action.r.waitForCooldown();
  expect(yi1.bonusAs).toBe(0);
  yi1.action.r.level = 3;
  await yi1.action.r.cast();
  expect(yi1.buffs).toHaveLength(1);
  expect(yi1.bonusAs).toBe(45);

  await yi1.action.r.waitForCooldown();
  expect(yi1.bonusAs).toBe(0);
  yi1.action.r.level = 5;
  await yi1.action.r.cast();
  expect(yi1.buffs).toHaveLength(1);
  expect(yi1.bonusAs).toBe(45);

  await yi1.action.r.waitForCooldown();
  expect(yi1.bonusAs).toBe(0);
});

test("MasterYi R Buff", async () => {
  const sim = new Simulation().start(10000);
  const yi1 = new MasterYi().init(sim);
  expect(yi1.buffs).toHaveLength(0);
  yi1.action.r.level = 1;
  expect(yi1.buffs).toHaveLength(0);
  yi1.action.r.cast();
  expect(yi1.buffs[0].name).toBe(MasterYiR.rname);
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
  expect(yi1.buffsNamed(MasterYiR.rname)[0].remainingTime).toBe(7000);
  yi2.interaction.takeDamage({ value: Infinity, src: yi2, type: DamageType.TRUE });
  expect(yi1.buffsNamed(MasterYiR.rname)[0].remainingTime).toBe(7000);

  await yi1.action.attack.cast(yi3);
  expect(yi1.buffsNamed(MasterYiR.rname)[0].isActive).toBe(true);
  const time = yi1.buffsNamed(MasterYiR.rname)[0].remainingTime;
  yi3.interaction.takeDamage({ value: Infinity, src: yi3, type: DamageType.TRUE });
  expect(yi1.buffsNamed(MasterYiR.rname)[0].remainingTime).toBe(time + 7000);
});