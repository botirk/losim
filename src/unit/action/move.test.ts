import { MasterYi } from "../../champions/MasterYi/MasterYi";
import { Simulation } from "../../simulation/simulation";

test("Move basic", async () => {
  const sim = new Simulation().start(15000000);
  const yi1 = new MasterYi().init(sim);

  expect(yi1.pos).toBe(0);
  expect(sim.time).toBe(0);
  expect(yi1.ms).toBe(355);
  expect(yi1.action.move.value).toBeCloseTo(yi1.ms * (sim.tickTime / 1000));

  const prom = yi1.action.move.cast(Infinity);
  expect(yi1.currentCast?.action.name).toBe("Move");
  await prom;

  expect(sim.time).toBe(0 + sim.tickTime);
  expect(yi1.pos).toBeCloseTo(yi1.action.move.value);
});

test("Move negative", async () => {
  const sim = new Simulation().start(15000000);
  const yi1 = new MasterYi().init(sim);

  expect(yi1.pos).toBe(0);
  expect(sim.time).toBe(0);
  expect(yi1.ms).toBe(355);
  expect(yi1.action.move.value).toBeCloseTo(yi1.ms * (sim.tickTime / 1000));

  const prom = yi1.action.move.cast(-Infinity);
  expect(yi1.currentCast?.action.name).toBe("Move");
  await prom;

  expect(sim.time).toBe(0 + sim.tickTime);
  expect(yi1.pos).toBeCloseTo(-yi1.action.move.value);
});