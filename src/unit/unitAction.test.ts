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
});

test("UnitAction.isAttacking", async () => { 
  const sim = new Simulation().start(5000) as any;
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);

  expect(yi1.action.isAttacking).toBe(false);
  const prom = yi1.action.attack(yi2);
  expect(yi1.action.isAttacking).toBe(true);
  await prom;
  expect(yi1.action.isAttacking).toBe(false);
});

test("UnitAction.attack multiple", async () => {
  const sim = new Simulation().start(5000) as any;
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  
  await Promise.all([yi1.action.attack(yi2), yi1.action.attack(yi2), yi1.action.attack(yi2), yi1.action.attack(yi2), yi1.action.attack(yi2), yi1.action.attack(yi2), yi1.action.attack(yi2), yi1.action.attack(yi2)]);
  expect(yi2.health).toBe(yi1.health - yi2.calcRawPhysicHit(yi1.ad));
  expect(sim.time).toBeLessThan(1500);
  expect(sim.time).toBeGreaterThan(0);
});

test("UnitAction.attack after death", async () => {
  const sim = new Simulation().start(5000) as any;
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  
  const prom = yi1.action.attack(yi2);
  expect(yi1.action.isAttacking).toBe(true);
  yi1.interaction.takeDamage(Infinity);
  expect(yi1.dead).toBe(true);
  expect(yi1.action.isAttacking).toBe(false);
});

test("UnitAction.cancelAttack", async () => {
  const sim = new Simulation().start(5000) as any;
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  
  expect(yi1.action.isAttacking).toBe(false);
  const prom = yi1.action.attack(yi2);
  expect(yi1.action.isAttacking).toBe(true);
  yi1.action.cancelAttack();
  expect(yi1.action.isAttacking).toBe(false);
});