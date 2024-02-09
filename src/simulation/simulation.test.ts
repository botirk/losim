import { MasterYi, MasterYiAction } from "../champions/MasterYi/MasterYi";
import { Nunu } from "../champions/Nunu/Nunu";
import { WheelItem } from "./defered";
import { Simulate1v1Config, Simulation, simulate1v1 } from "./simulation";

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

  expect(sim.waitFor(15000)).resolves.toBe(false);
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

  const wait2 = sim.waitFor(1000);
  wait2.remainingTime = 500;
  expect(wait2.waitFor).toBe(500);
  await wait2;
  expect(sim.time).toBe(750 + 500);
});

test("Simulation.start", async () => {
  const sim = new Simulation().start(25000) as any;
  expect(sim.wheel).toHaveLength(1);
  expect(sim.wheel[0].time).toBe(25000);

  expect(sim.waitFor(25001)).resolves.toBe(false);
});

test("Simulation.start", async () => {
  const sim = new Simulation().start(25000) as any;
  expect(sim.wheel).toHaveLength(1);
  expect(sim.wheel[0].time).toBe(25000);

  expect(sim.waitFor(25001)).resolves.toBe(false);
});

test("Simulate1v1", async () => {
  const result = await simulate1v1((sim) => {
    const yi = new MasterYi().init(sim);
    const nunu = new Nunu().init(sim);
    const logic = (champ, enemy) => champ.killDummy(enemy);
    return [yi, logic, nunu, logic];
  });
  if (!result) {
    expect(result).toBeTruthy();
    return;
  }
  expect(result.winner).toBe(result.champion1);
  expect(result.dps1).toBeGreaterThan(25);
  expect(result.dps1).toBeLessThan(100);

  expect(result.dps2).toBeGreaterThan(15);
  expect(result.dps2).toBeLessThan(70);

  expect(result.distance).toBeLessThan(500);
});

test("Simulate1v1 break", async () => {
  const result = await simulate1v1((sim) => {
    return undefined;
  });
  
  expect(result).toBe(undefined);
});

test("Simulate1v1 undying nunu", async () => {
  const config = new Simulate1v1Config();
  config.undying2 = true;
  const result = await simulate1v1((sim) => {
    const yi = new MasterYi().init(sim);
    const nunu = new Nunu().init(sim);
    const logic = (champ, enemy) => champ.killDummy(enemy);
    return [yi, logic, nunu, logic];
  }, config);
  if (!result) {
    expect(result).toBeTruthy();
    return;
  }
  expect(result.winner === result.champion2).toBe(true);
});

test("Simulate1v1 undying nunu 2", async () => {
  const config = new Simulate1v1Config();
  config.undying1 = true;
  const result = await simulate1v1((sim) => {
    const yi = new MasterYi().init(sim);
    const nunu = new Nunu().init(sim);
    const logic = (champ, enemy) => champ.killDummy(enemy);
    return [nunu, logic, yi, logic];
  }, config);
  if (!result) {
    expect(result).toBeTruthy();
    return;
  }
  expect(result.winner === result.champion1).toBe(true);
});

test("Simulate1v1 sustain 1", async () => {
  const config = new Simulate1v1Config();
  config.sustain1 = true;
  const result = await simulate1v1((sim) => {
    const yi = new MasterYi().init(sim);
    const nunu = new Nunu().init(sim);
    const logic = (champ, enemy) => champ.killDummy(enemy);
    return [yi, logic, nunu, logic];
  }, config);
  if (!result) {
    expect(result).toBeTruthy();
    return;
  }
  expect(result.winner === result.champion2).toBe(true);
});

test("Simulate1v1 sustain 2", async () => {
  const config = new Simulate1v1Config();
  config.sustain2 = true;
  const result = await simulate1v1((sim) => {
    const yi = new MasterYi().init(sim);
    const nunu = new Nunu().init(sim);
    const logic = (champ, enemy) => champ.killDummy(enemy);
    return [nunu, logic, yi, logic];
  }, config);
  if (!result) {
    expect(result).toBeTruthy();
    return;
  }
  expect(result.winner === result.champion1).toBe(true);
});

