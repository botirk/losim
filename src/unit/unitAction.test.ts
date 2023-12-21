import { MasterYi } from "../champions/MasterYi/MasterYi";
import { Rejection } from "../defered";
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
  
  const aa = yi1.action.attack(yi2);
  expect(yi1.action.isAttacking).toBe(true);
  yi1.interaction.takeDamage(Infinity);
  expect(yi1.dead).toBe(true);
  await aa;
  expect(yi1.action.isAttacking).toBe(false);
});

test("UnitAction.cancelAttack", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  
  expect(yi1.action.isAttacking).toBe(false);
  const prom = yi1.action.attack(yi2);
  expect(yi1.action.isAttacking).toBe(true);
  yi1.action.cancelAttack();
  expect(yi1.action.isAttacking).toBe(false);
});

test("UnitAction.attack after target death", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  expect(yi1.dead).toBe(false);
  expect(yi2.dead).toBe(false);
  
  const aa = yi1.action.attack(yi2);
  expect(yi1.action.isAttacking).toBe(true);
  yi2.interaction.takeDamage(Infinity);
  expect(yi2.dead).toBe(true);
  await aa;
  expect(yi1.action.isAttacking).toBe(false);
});

test("UnitAction.attack cooldown after attack", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  expect(yi1.dead).toBe(false);
  expect(yi2.dead).toBe(false);
  
  expect(yi1.action.isAttacking).toBe(false);
  const aa = yi1.action.attack(yi2);
  expect(yi1.action.isAttacking).toBe(true);
  await aa;
  expect(yi1.action.isAttacking).toBe(false);

  const time1 = sim.time;
  expect(yi1.action.isAttackRewind).toBe(true);
  await yi1.action.waitAttackRewind();
  expect(yi1.action.isAttackRewind).toBe(false);
  expect(time1).toBeLessThan(sim.time);
});

test("UnitAction.attack cooldown compliance", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  
  expect(yi1.action.isAttacking).toBe(false);
  const aa = yi1.action.attack(yi2);
  expect(yi1.action.isAttacking).toBe(true);
  await aa;
  expect(yi1.action.isAttacking).toBe(false);

  const time1 = sim.time;
  expect(yi1.action.isAttackRewind).toBe(true);
  await yi1.action.attack(yi2);
  expect(sim.time).toBeCloseTo(time1 + (1 / yi1.as) * 1000);
  expect(yi1.action.isAttacking).toBe(false);
  expect(yi1.action.isAttackRewind).toBe(true);
});

test("UnitAction.attack dead", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  
  yi2.interaction.takeDamage(Infinity);
  expect(yi2.dead).toBe(true);

  const time = sim.time;
  await yi1.action.attack(yi2);
  expect(sim.time).toBe(time);
});