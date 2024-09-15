import { MasterYi } from "../champions/MasterYi/MasterYi";
import { Simulation } from "../simulation/simulation";

test("UnitInteraction.takeDamage", async () => {
  const sim = new Simulation().start(5000);
  const yi = new MasterYi().init(sim);
  
  expect(yi.health).toBe(yi.maxHealth);
  yi.interaction.takeDamage(100, yi);
  expect(yi.health).toBe(yi.maxHealth - 100);
});

test("UnitInteraction.onTakeDamage", async () => {
  const sim = new Simulation().start(5000);
  const yi = new MasterYi().init(sim) as any;
  
  let proc = 0;
  expect(yi.health).toBe(yi.maxHealth);
  const remove1 = yi.interaction.onTakeDamage((value, src) => {
    proc += 1;
    expect(value).toBe(100);
    expect(src).toBe(yi);
    expect(yi.health).toBe(yi.maxHealth - 100);
  });
  expect(yi.interaction._onTakeDamage).toHaveLength(1);
  yi.interaction.takeDamage(100, yi);
  expect(proc).toBe(1);
  remove1();
  expect(yi.interaction._onTakeDamage).toHaveLength(0);

  const remove2 = yi.interaction.onTakeDamage((value, src) => {
    proc += 1;
    expect(value).toBe(125);
    expect(src).toBe(yi);
    expect(yi.health).toBe(yi.maxHealth - 100 - 125);
  });
  expect(yi.interaction._onTakeDamage).toHaveLength(1);
  yi.interaction.takeDamage(125, yi);
  expect(proc).toBe(2);
  remove2();
  expect(yi.interaction._onTakeDamage).toHaveLength(0);

  const remove3 = yi.interaction.onTakeDamage((value, src) => {
    proc += 1;
    expect(value).toBe(yi.maxHealth - 100 - 125);
    expect(src).toBe(yi);
    expect(yi.health).toBe(0);
  });
  expect(yi.interaction._onTakeDamage).toHaveLength(1);
  yi.interaction.takeDamage(10000, yi);
  expect(proc).toBe(3);
  remove3();
  expect(yi.interaction._onTakeDamage).toHaveLength(0);
});

test("UnitInteraction.onDeath", async () => {
  const sim = new Simulation().start(30000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  const prom = yi2.interaction.onDeath();
  while (!sim.isStopped && !yi2.dead) {
    await yi1.action.attack.cast(yi2);
  }
  expect(sim.isStopped).toBeFalsy();
  expect(sim.time).toBeLessThan(20000);
  expect(sim.time).toBeGreaterThan(5000);
  expect(yi2.dead).toBe(true);
  expect(yi2.health).toBe(0);
  const res = await prom;
  expect(res).toBeUndefined();
});

test('UnitInteraction.onTakedown', async () => {
  const sim = new Simulation().start(15000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  
  let counted = 0;
  let kills = 0;
  yi1.interaction.onTakedown((unit) => {
    if (unit === yi2) counted += 1;
  });
  yi1.interaction.onKill((unit) => {
    if (unit === yi2) kills += 1;
  });

  await yi1.action.attack.cast(yi2);
  await sim.waitFor(1000);
  yi2.interaction.takeDamage(Infinity, yi2);
  expect(counted).toBe(1);
  expect(kills).toBe(0);
});

test('UnitInteraction.onKill', async () => {
  const sim = new Simulation().start(35000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  
  let counted = 0;
  yi1.interaction.onKill((unit) => {
    if (unit === yi2) counted += 1;
  });
  while (!yi2.dead) await yi1.action.attack.cast(yi2);

  expect(counted).toBe(1);
});