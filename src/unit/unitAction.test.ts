import { MasterYi } from "../champions/MasterYi/MasterYi";
import { Simulation } from "../simulation/simulation";

test("UnitAction.attack", async () => {
  const sim = new Simulation().start(5000) as any;
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  expect(yi1.action.attack.name).toBe("Attack");
  expect(yi2.action.attack.name).toBe("Attack");
  
  await yi1.action.attack.cast(yi2);
  expect(sim.time).toBeGreaterThan(100);
  expect(sim.time).toBeLessThan(600);
  expect(yi2.health).toBeCloseTo(yi1.health - yi2.calcRawPhysicHit(yi2.ad));
});

test("UnitAction.attack.isCasting", async () => { 
  const sim = new Simulation().start(5000) as any;
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);

  expect(yi1.action.attack.isCasting).toBe(false);
  const prom = yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.isCasting).toBe(true);
  await prom;
  expect(yi1.action.attack.isCasting).toBe(false);
});

test("UnitAction.attack multiple", async () => {
  const sim = new Simulation().start(5000) as any;
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  
  await Promise.all([yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2)]);
  expect(yi2.health).toBe(yi1.health - yi2.calcRawPhysicHit(yi1.ad));
  expect(sim.time).toBeLessThan(1500);
  expect(sim.time).toBeGreaterThan(0);
});

test("UnitAction.attack after death", async () => {
  const sim = new Simulation().start(5000) as any;
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  
  const aa = yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.isCasting).toBe(true);
  yi1.interaction.takeDamage(Infinity, yi1);
  expect(yi1.dead).toBe(true);
  await aa;
  expect(sim.time).toBe(0);
  expect(yi1.action.attack.isCasting).toBe(false);
});

test("UnitAction.cancelAttack", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  
  expect(yi1.action.attack.isCasting).toBe(false);
  const prom = yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.isCasting).toBe(true);
  yi1.action.attack.cancelByUser();
  expect(yi1.action.attack.isCasting).toBe(false);
});

test("UnitAction.attack after target death", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  expect(yi1.dead).toBe(false);
  expect(yi2.dead).toBe(false);
  
  const aa = yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.isCasting).toBe(true);
  yi2.interaction.takeDamage(Infinity, yi2);
  expect(yi2.dead).toBe(true);
  await aa;
  expect(yi1.action.attack.isCasting).toBe(false);
});

test("UnitAction.attack cooldown after attack", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  expect(yi1.dead).toBe(false);
  expect(yi2.dead).toBe(false);
  
  expect(yi1.action.attack.isCasting).toBe(false);
  const aa = yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.isCasting).toBe(true);
  await aa;
  expect(yi1.action.attack.isCasting).toBe(false);

  const time1 = sim.time;
  expect(yi1.action.attack.isCooldown).toBe(true);
  await yi1.action.attack.waitForCooldown();
  expect(yi1.action.attack.isCooldown).toBe(false);
  expect(time1).toBeLessThan(sim.time);
});

test("UnitAction.attack cooldown compliance", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  
  expect(yi1.action.attack.isCasting).toBe(false);
  const aa = yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.isCasting).toBe(true);
  await aa;
  expect(yi1.action.attack.isCasting).toBe(false);

  const time1 = sim.time;
  expect(yi1.action.attack.isCooldown).toBe(true);
  await yi1.action.attack.cast(yi2);
  expect(sim.time).toBeCloseTo(time1 + (1 / yi1.as) * 1000);
  expect(yi1.action.attack.isCasting).toBe(false);
  expect(yi1.action.attack.isCooldown).toBe(true);
});

test("UnitAction.attack dead", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  
  yi2.interaction.takeDamage(Infinity, yi2);
  expect(yi2.dead).toBe(true);

  const time = sim.time;
  await yi1.action.attack.cast(yi2);
  expect(sim.time).toBe(time);
});

test("UnitAction.attack onHit", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  
  let hit = 0;
  const remove = yi1.action.attack.onHitUnit((target) => {
    hit += 1;
    expect(target).toBe(yi2);
    if (hit === 3) remove();
  });

  await yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.isCasting).toBe(false);
  expect(yi1.action.attack.isCooldown).toBe(true);
  expect(hit).toBe(1);

  await yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.isCasting).toBe(false);
  expect(yi1.action.attack.isCooldown).toBe(true);
  expect(hit).toBe(2);

  await yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.isCasting).toBe(false);
  expect(yi1.action.attack.isCooldown).toBe(true);
  expect(hit).toBe(3);
});

test("UnitAction.attack change of unit.bonusAS", async () => {
  const sim = new Simulation().start(15000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  
  const prom = yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.remainingCast).toBeGreaterThan(50);
  expect(yi1.action.attack.remainingCast).toBeLessThan(700);
  const savedCastTime = yi1.action.attack.remainingCast;
  yi1.bonusAs += 1;
  expect(yi1.action.attack.remainingCast).toBeGreaterThan(50);
  expect(yi1.action.attack.remainingCast).toBeLessThan(savedCastTime);

  await prom;
  expect(yi1.action.attack.remainingCooldown).toBeGreaterThan(300);
  expect(yi1.action.attack.remainingCooldown).toBeLessThan(1500);
  const savedCd = yi1.action.attack.remainingCooldown;
  yi1.bonusAs = 0;
  expect(yi1.action.attack.remainingCooldown).toBeGreaterThan(savedCd);
  expect(yi1.action.attack.remainingCooldown).toBeLessThan(1500);
});

test("UnitAction.attack cancel", async () => {
  const sim = new Simulation().start(15000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);

  expect(yi1.action.attack.isCancelableByUser).toBe(true);
  yi1.action.attack.cast(yi2);
  const aaCastTime = yi1.action.attack.remainingCast;
  expect(aaCastTime).toBeGreaterThan(100);
  await sim.waitFor(100);
  expect(yi1.action.attack.isCasting).toBe(true);
  yi1.action.attack.cancelByUser();
  expect(yi1.action.attack.isCasting).toBe(false);
  expect(yi1.action.attack.isCooldown).toBe(false);

  await yi1.action.attack.cast(yi2);
  expect(sim.time).toBe(100 + aaCastTime);
});