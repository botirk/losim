import { MasterYi } from "../champions/MasterYi/MasterYi";
import { Simulation } from "../simulation/simulation";

test("UnitAction.attack", async () => {
  const sim = new Simulation().start(5000) as any;
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  
  await yi1.action.attack(yi2);
  expect(sim.time).toBeGreaterThan(100);
  expect(sim.time).toBeLessThan(600);
  expect(yi2.health).toBeCloseTo(yi1.health - yi2.calcRawPhysicHit(yi2.ad));
})