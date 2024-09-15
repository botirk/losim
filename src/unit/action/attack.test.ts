import { MasterYi } from "../../champions/MasterYi/MasterYi";
import { Simulation } from "../../simulation/simulation";
import { DamageType } from "../unitInteraction";

test("attack", async () => {
  const sim = new Simulation().start(5000) as any;
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  expect(yi1.action.attack.name).toBe("Attack");
  expect(yi2.action.attack.name).toBe("Attack");
  
  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(sim.time).toBeGreaterThan(100);
  expect(sim.time).toBeLessThan(600);
  expect(yi2.health).toBeCloseTo(yi1.health - yi1.action.attack.calc(yi2));
});

test("attack.currentCast.isCasting", async () => { 
  const sim = new Simulation().start(5000) as any;
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);

  expect(yi1.action.attack.currentCast).toBeUndefined();
  const prom = yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.currentCast).toBeTruthy();
  expect(yi1.action.attack.currentCast?.isCasting).toBe(true);
  await prom;
  expect(yi1.action.attack.currentCast).toBeUndefined();
});

test("attack multiple", async () => {
  const sim = new Simulation().start(5000) as any;
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);

  let count = 0;
  yi2.interaction.onTakeDamage(() => count += 1);
  
  await Promise.all([yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2)]);
  expect(count).toBe(1);
  expect(yi1.action.attack.calc(yi2)).toBeGreaterThan(30);
  expect(yi2.health).toBe(yi1.health - yi1.action.attack.calc(yi2));
  expect(sim.time).toBeLessThan(1500);
  expect(sim.time).toBeGreaterThan(0);
});

test("attack after death", async () => {
  const sim = new Simulation().start(5000) as any;
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);

  let hits = 0;
  yi2.interaction.onTakeDamage(() => hits += 1);
  
  const aa = yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.currentCast?.isCasting).toBe(true);
  yi1.interaction.takeDamage({ value: Infinity, src: yi1, type: DamageType.TRUE });
  expect(yi1.dead.value).toBe(true);
  await aa;
  expect(hits).toBe(0);
  expect(sim.time).toBe(0);
  expect(yi1.action.attack.currentCast).toBeUndefined();
});

test("cancelAttack", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);

  let hits = 0;
  yi2.interaction.onTakeDamage(() => hits += 1);
  
  expect(yi1.action.attack.currentCast).toBeUndefined();
  const prom = yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.currentCast?.isCasting).toBe(true);
  yi1.action.attack.currentCast?.cancel();
  expect(yi1.action.attack.currentCast).toBeUndefined();
  await prom;
  expect(hits).toBe(0);
});

test("attack after target death", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  expect(yi1.dead.value).toBe(false);
  expect(yi2.dead.value).toBe(false);
  
  const aa = yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.currentCast?.isCasting).toBe(true);
  expect(yi1.dead.value).toBe(false);
  yi2.interaction.takeDamage({ value: Infinity, src: yi2, type: DamageType.TRUE });

  let hits = 0;
  yi2.interaction.onTakeDamage(() => hits += 1);

  expect(yi2.dead.value).toBe(true);
  const res = await aa;
  expect(res).toBe(false);
  expect(yi1.action.attack.currentCast).toBeUndefined();
  expect(hits).toBe(0);
});

test("attack cooldown after attack", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  expect(yi1.dead.value).toBe(false);
  expect(yi2.dead.value).toBe(false);
  
  expect(yi1.action.attack.currentCast).toBeUndefined()
  const aa = yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.currentCast?.isCasting).toBe(true);
  await aa;
  expect(yi1.action.attack.currentCast).toBeUndefined();

  const time1 = sim.time;
  expect(yi1.action.attack.isCooldown).toBe(true);
  await yi1.action.attack.waitCooldown();
  expect(yi1.action.attack.isCooldown).toBe(false);
  expect(time1).toBeLessThan(sim.time);
});

test("attack cooldown compliance", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);
  
  expect(yi1.action.attack.currentCast).toBe(undefined)
  const aa = yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.currentCast?.isCasting).toBe(true);
  await aa;
  expect(yi1.action.attack.currentCast).toBe(undefined)

  const time1 = sim.time;
  expect(yi1.action.attack.isCooldown).toBe(true);
  expect(yi1.action.attack.castable(yi2)).toBe(true);
  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(sim.time).toBeCloseTo(time1 + (1 / yi1.as) * 1000);
  expect(yi1.action.attack.currentCast).toBeUndefined();
  expect(yi1.action.attack.isCooldown).toBe(true);
});

test("attack dead", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.health).toBe(yi2.health);

  yi2.interaction.takeDamage({ value: Infinity, src: yi2, type: DamageType.TRUE });
  expect(yi2.dead.value).toBe(true);

  let hits = 0;
  yi2.interaction.onTakeDamage(() => hits += 1);

  const time = sim.time;
  await yi1.action.attack.cast(yi2);
  expect(sim.time).toBe(time);
  expect(hits).toBe(0);
});

test("attack onHit", async () => {
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
  expect(yi1.action.attack.currentCast).toBeUndefined();
  expect(yi1.action.attack.isCooldown).toBe(true);
  expect(hit).toBe(1);

  await yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.currentCast).toBeUndefined();
  expect(yi1.action.attack.isCooldown).toBe(true);
  expect(hit).toBe(2);

  await yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.currentCast).toBeUndefined();
  expect(yi1.action.attack.isCooldown).toBe(true);
  expect(hit).toBe(3);
});

test("attack change of unit.bonusAS", async () => {
  const sim = new Simulation().start(15000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  
  const prom = yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.currentCast?.remaining).toBeGreaterThan(50);
  expect(yi1.action.attack.currentCast?.remaining).toBeLessThan(700);
  const savedCastTime = yi1.action.attack.currentCast?.remaining as number;
  yi1.bonusAs.value += 1;
  expect(yi1.action.attack.currentCast?.remaining).toBeGreaterThan(50);
  expect(yi1.action.attack.currentCast?.remaining).toBeLessThan(savedCastTime);

  await prom;
  expect(yi1.action.attack.remainingCooldown).toBeGreaterThan(300);
  expect(yi1.action.attack.remainingCooldown).toBeLessThan(1500);
  const savedCd = yi1.action.attack.remainingCooldown;
  yi1.bonusAs.value = 0;
  expect(yi1.action.attack.remainingCooldown).toBeGreaterThan(savedCd);
  expect(yi1.action.attack.remainingCooldown).toBeLessThan(1500);
});

test("attack cancel", async () => {
  const sim = new Simulation().start(15000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);

  let count = 0;
  yi2.interaction.onTakeDamage(() => count += 1);

  expect(yi1.action.attack.isCancelableByUser).toBe(true);
  yi1.action.attack.cast(yi2);
  const aaCastTime = yi1.action.attack.currentCast?.remaining as number;
  expect(aaCastTime).toBeGreaterThan(100);
  await sim.waitFor(100);
  expect(yi1.action.attack.currentCast?.isCasting).toBe(true);
  expect(yi1.action.attack.isCooldown).toBe(true);
  await yi1.action.attack.currentCast?.cancel();
  expect(yi1.action.attack.currentCast).toBe(undefined);
  expect(yi1.action.attack.isCooldown).toBe(false);

  const result = await yi1.action.attack.cast(yi2);
  expect(result).toBe(true);
  expect(sim.time).toBe(100 + aaCastTime);

  expect(count).toBe(1);
});

test("attack x5", async () => {
  const sim = new Simulation().start(15000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);

  const attack = yi1.action.attack.cast(yi2);
  const duration = yi1.action.attack.currentCast?.remaining;
  await Promise.all([attack, yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2), yi1.action.attack.cast(yi2)]);
  expect(sim.time).toBe(duration);
});

test("attack finish cooldown", async () => {
  const sim = new Simulation().start(15000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);

  await yi1.action.attack.cast(yi2);
  expect(yi1.action.attack.isCooldown).toBe(true);
  yi1.action.attack.finishCooldown();
  expect(yi1.action.attack.isCooldown).toBe(false);

  const time = sim.time;
  await yi1.action.attack.cast(yi2);
  expect(sim.time).toBe(time * 2);
});

test("attack untargetable", async () => {
  const sim = new Simulation().start(15000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  yi2.targetable.value = false;
  await yi1.action.attack.cast(yi2);
  expect(sim.time).toBe(0);
  expect(yi1.action.attack.isCooldown).toBe(false);
  expect(yi1.action.attack.currentCast).toBeUndefined();

  yi2.targetable.value = true;
  await yi1.action.attack.cast(yi2);
  expect(sim.time).toBeGreaterThan(100);
  expect(yi1.action.attack.isCooldown).toBe(true);
});

test("attack targetable further", async () => {
  const sim = new Simulation().start(15000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  
  const aa = yi1.action.attack.cast(yi2);
  await sim.waitFor(25);
  yi2.targetable.value = false;
  await aa;
  expect(sim.time).toBe(25);
  expect(yi1.action.attack.isCooldown).toBe(false);
  expect(yi1.currentCast.value).toBeUndefined();

  yi2.targetable.value = true;
  await yi1.action.attack.cast(yi2);
  expect(sim.time).toBeGreaterThan(100);
  expect(yi1.action.attack.isCooldown).toBe(true);
});

test("attack move", async () => {
  const sim = new Simulation().start(15000000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  yi1.action.passive.disabled = true;
  yi1.crit = 50;
  
  let crits = 0;
  yi2.interaction.onTakeDamage((e) => {
    if (e.isCrit) {
      crits += 1;
      expect(e.value).toBeCloseTo(yi1.action.attack.calc(yi2) * 1.75);
    }
  });

  for (let i = 0; i < 1000; i += 1) {
    await yi1.action.attack.cast(yi2);
    yi2.health = yi2.maxHealth;
  }

  expect(crits).toBeGreaterThan(400);
  expect(crits).toBeLessThan(600);
});

test("attack crits", async () => {
  const sim = new Simulation().start(15000000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  
  yi2.pos = yi1.pos + 500;

  expect(await yi1.action.attack.cast(yi2)).toBe(false);
  expect(sim.time).toBe(0);

  yi2.pos = yi1.pos;
  expect(await yi1.action.attack.cast(yi2)).toBe(true);
});

test("attack lifesteal", async () => {
  const sim = new Simulation().start(15000000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  
  yi1.health = 1;
  yi1.lifesteal = 100;

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.health).toBeGreaterThan(yi1.action.attack.calc(yi2));
  expect(yi1.health).toBeLessThan(yi1.action.attack.calc(yi2) + 2);
});