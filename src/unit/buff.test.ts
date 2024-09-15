import { Simulation } from "../simulation/simulation";
import { MasterYi } from "../champions/MasterYi/MasterYi";
import { Buff, TimedBuff } from "./buff";

test("Buff creation / deletion", () => {
  const sim = new Simulation().start(5000);
  const yi = new MasterYi().init(sim);

  const buff =  new Buff("test", yi);
  expect(yi.buffs).toContain(buff);
  expect(yi.buffs[0].name).toBe("test");
  expect(yi.buffsNamed("test")[0]).toBe(buff);

  buff.fade();
  expect(yi.buffs.includes(buff)).toBe(false);
  expect(yi.buffsNamed("test")[0]).toBe(undefined);
});

test("TimedBuff creation / autoDeletion", async () => {
  const sim = new Simulation().start(5000);
  const yi = new MasterYi().init(sim);

  expect(yi.buffs).toHaveLength(0);
  const buff =  new TimedBuff("test", yi, 1000);
  expect(yi.buffs).toContain(buff);

  await sim.waitFor(500);
  expect(yi.buffs).toContain(buff);
  await sim.waitFor(499);
  expect(yi.buffs).toContain(buff);
  await sim.waitFor(5);
  expect(yi.buffs.includes(buff)).toBe(false);
  expect(buff.isActive).toBe(false);
});

test("TimedBuff remaining", async () => {
  const sim = new Simulation().start(5000);
  const yi = new MasterYi().init(sim);

  expect(yi.buffsNamed("test")[0]).toBe(undefined);
  const buff =  new TimedBuff("test", yi, 1000);
  expect(yi.buffsNamed("test")[0].remainingTime).toBe(1000);

  await sim.waitFor(500);
  expect(yi.buffsNamed("test")[0].remainingTime).toBe(500);
  await sim.waitFor(499);
  expect(yi.buffsNamed("test")[0].remainingTime).toBe(1);

  yi.buffsNamed("test")[0].remainingTime = 500;
  expect(yi.buffsNamed("test")[0].remainingTime).toBe(500);

  await sim.waitFor(250);
  expect(yi.buffsNamed("test")[0].remainingTime).toBe(250);

  await sim.waitFor(400);
  expect(yi.buffsNamed("test")[0]).toBe(undefined);
});

test("TimedBuff duration", async () => {
  const sim = new Simulation().start(5000);
  const yi = new MasterYi().init(sim);

  expect(yi.buffsNamed("test")[0]).toBe(undefined);
  const buff =  new TimedBuff("test", yi, 1000);
  expect(yi.buffsNamed("test")[0].remainingTime).toBe(1000);

  await sim.waitFor(500);
  expect(yi.buffsNamed("test")[0].remainingTime).toBe(500);
  
  expect(buff.duration).toBe(1000);
  buff.duration = 1500;
  expect(buff.duration).toBe(1500);
  expect(yi.buffsNamed("test")[0].remainingTime).toBe(1000);

  await sim.waitFor(1001);
  expect(yi.buffsNamed("test")[0]).toBe(undefined);
});