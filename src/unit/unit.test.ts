import { MasterYi } from "../champions/MasterYi/MasterYi";
import { Simulation } from "../simulation/simulation";

test("Unit.onBonusASChange", () => {
  const yi = new MasterYi().init();
  let changed = false;
  expect(yi.bonusAs).toBe(0);
  yi.onBonusASChange(() => { changed = true; });
  yi.bonusAs = 1;
  expect(yi.bonusAs).toBe(1);
  expect(changed).toBe(true);
});

test("Unit.targetable", () => {
  const yi = new MasterYi().init();
  yi.targetable = false;
  yi.targetable = false;
  expect(yi.targetable).toBe(false);
  yi.targetable = true;
  expect(yi.targetable).toBe(false);
  yi.targetable = true;
  expect(yi.targetable).toBe(true);
  yi.dead = true;
  expect(yi.targetable).toBe(false);
});

test("Unit.onDeath", async () => {
  const sim = new Simulation().start(30000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);

  let proc = 0;
  yi2.onDeath(() => {
    proc += 1;
  });

  while (!sim.isStopped && !yi2.dead) {
    await yi1.action.attack.cast(yi2);
  }
  expect(sim.isStopped).toBeFalsy();
  expect(sim.time).toBeLessThan(20000);
  expect(sim.time).toBeGreaterThan(5000);
  expect(yi2.dead).toBe(true);
  expect(yi2.health).toBe(0);
  expect(proc).toBe(1);
});

test("Unit.ad", () => {
  const yi = new MasterYi().init();
  expect(yi.ad).toBeGreaterThan(40);
  const ad = yi.ad;
  yi.bonusAd += 10;
  expect(yi.ad).toBe(ad + 10);
});