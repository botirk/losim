import { MasterYi } from "../champions/MasterYi/MasterYi";
import { Simulation } from "../simulation/simulation";

test("UnitInteraction.takeDamage", async () => {
  const sim = new Simulation().start(5000);
  const yi = new MasterYi().init(sim);
  
  expect(yi.health).toBe(yi.maxHealth);
  yi.interaction.takeDamage(100);
  expect(yi.health).toBe(yi.maxHealth - 100);
});

test("UnitInteraction.onTakeDamage", async () => {
  const sim = new Simulation().start(5000);
  const yi = new MasterYi().init(sim);
  
  expect(yi.health).toBe(yi.maxHealth);
  const prom = yi.interaction.onTakeDamage();
  yi.interaction.takeDamage(100);
  const res = await prom;
  expect(res).toBe(100);
  expect(yi.health).toBe(yi.maxHealth - 100);

  const prom2 = yi.interaction.onTakeDamage();
  yi.interaction.takeDamage(125);
  const res2 = await prom2;
  expect(res2).toBe(125);
  expect(yi.health).toBe(yi.maxHealth - 100 - 125);

  const prom3 = yi.interaction.onTakeDamage();
  yi.interaction.takeDamage(10000);
  const res3 = await prom3;
  expect(res3).toBe(yi.maxHealth - 100 - 125);
  expect(yi.health).toBe(0);
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