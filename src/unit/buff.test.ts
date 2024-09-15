import { Simulation } from "../simulation/simulation";
import { MasterYi } from "../champions/MasterYi/MasterYi";
import { Buff, TimedBuff } from "./buff";

test("Buff creation / deletion", () => {
  const sim = new Simulation().start(5000);
  const yi = new MasterYi().init(sim);

  const buff =  new Buff("test", yi);
  expect(yi.buffs).toContain(buff);
  expect(yi.buffs[0].name).toBe("test");

  buff.fade();
  expect(yi.buffs.includes(buff)).toBe(false);
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