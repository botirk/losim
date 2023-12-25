import { Rejection, WheelItem } from "./defered";
import { Simulation } from "./simulation";

test("Simulation.time", () => {
  const sim = new Simulation();

  expect(sim.time).toBe(0);
});

test("Simulation.insertIntoWheel", async () => {
  const sim = new Simulation() as any;
  expect(sim.wheel).toHaveLength(0);

  const wheelItem = new WheelItem(undefined, sim, 1000, () => {});
  expect(wheelItem.time).toBe(1000);

  sim.insertIntoWheel(wheelItem);
  expect(sim.wheel).toHaveLength(1);

  const wheelItem1 = new WheelItem(undefined, sim, 500, () => {});
  expect(wheelItem1.time).toBe(500);
  const wheelItem2 = new WheelItem(undefined, sim, 2500, () => {});
  expect(wheelItem2.time).toBe(2500);

  sim.insertIntoWheel(wheelItem1);
  expect(sim.wheel).toHaveLength(2);
  expect(sim.wheel[0]).toBe(wheelItem);
  expect(sim.wheel[1]).toBe(wheelItem1);

  sim.insertIntoWheel(wheelItem2);
  expect(sim.wheel).toHaveLength(3);
  expect(sim.wheel[0]).toBe(wheelItem2);
  expect(sim.wheel[1]).toBe(wheelItem);
  expect(sim.wheel[2]).toBe(wheelItem1);
});

test("Simulation.wait", async () => {
  const sim = new Simulation().start(15000) as any;

  const wait = sim.waitFor(1000);
  expect(sim.wheel).toHaveLength(2);
  expect(sim.wheel[1]).toBe(wait);

  await wait;
  expect(sim.isStopped).toBeFalsy();
  expect(sim.wheel).toHaveLength(1);
  expect(sim.time).toBe(1000);

  await sim.waitFor(1500);
  expect(sim.time).toBe(2500);

  const w700 = sim.waitFor(700);
  const w300 = sim.waitFor(300);

  await Promise.all([w700, w300]);
  expect(sim.time).toBe(2500 + 700);

  expect(sim.waitFor(15000)).rejects.toBe(Rejection.SimulationStopped);
});

test("Simulation.wait reschedule", async () => {
  const sim = new Simulation().start(15000);

  const wait = sim.waitFor(1000);
  await sim.waitFor(500);
  expect(sim.time).toBe(500);
  expect(wait.remainingTime).toBe(500);

  wait.waitFor = 750;
  expect(wait.remainingTime).toBe(250);
  await wait;
  expect(sim.time).toBe(750);
});

test("Simulation.start", async () => {
  const sim = new Simulation().start(25000) as any;
  expect(sim.wheel).toHaveLength(1);
  expect(sim.wheel[0].time).toBe(25000);

  expect(sim.waitFor(25001)).rejects.toBe(Rejection.SimulationStopped);
});

