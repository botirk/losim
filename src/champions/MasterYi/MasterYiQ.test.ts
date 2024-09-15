import { MasterYi } from "./MasterYi";
import { Simulation } from "../../simulation/simulation";
import { DamageType } from "../../unit/unitInteraction";
import { MasterYiQ, MasterYiQMark } from "./MasterYiQ";
import { enemyActionLevelTest, enemyActionManaTest, enemyActionTargetableTest } from "../../unit/action/actionTest";

enemyActionManaTest(MasterYiQ.qname, (sim) => new MasterYi().init(sim).action.q);

enemyActionLevelTest(MasterYiQ.qname, (sim) => new MasterYi().init(sim).action.q);

enemyActionTargetableTest(MasterYiQ.qname, (sim) => new MasterYi().init(sim).action.q);

test("MasterYi Q 4 Marks", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  yi1.action.q.level = 1;

  let count = 0;
  yi2.interaction.onTakeDamage((e) => count += 1);

  expect(yi1.action.q.castable(yi2)).toBe(true);
  const cast = yi1.action.q.cast(yi2);

  await sim.waitFor(500);
  expect(yi2.buffNamed(MasterYiQ.qname)).toBeInstanceOf(MasterYiQMark);

  await cast;
  expect(count).toBe(4);
});

test("MasterYi Q Reduced damage", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  yi1.action.q.level = 1;

  let count = new Map<number, number>();
  yi2.interaction.onTakeDamage((e) => {
    count.set(e.value, (count.get(e.value) || 0) + 1);
  });

  expect(yi1.action.q.castable(yi2)).toBe(true);
  await yi1.action.q.cast(yi2);

  const keys = Array.from(count.keys());
  if (count.get(keys[0]) === 1) {
    expect(count.get(keys[1])).toBe(3);
    expect(count.get(keys[0])).toBe(1);
  } else {
    expect(count.get(keys[0])).toBe(3);
    expect(count.get(keys[1])).toBe(1);
  }
});

test("MasterYi Q 4 Marks + 4 True damage", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  yi1.action.q.level = 1;
  yi1.action.e.level = 1;

  let countP = 0, countT = 0, onHits = 0;
  yi2.interaction.onTakeDamage((e) => {
    if (e.type === DamageType.PHYSIC) countP += 1;
    else if (e.type === DamageType.TRUE) countT += 1;
  });
  yi1.action.attack.onHitUnit(() => onHits += 1);

  yi1.action.e.cast();
  await yi1.action.q.cast(yi2);
  expect(countP).toBe(4);
  expect(countT).toBe(4);
  expect(onHits).toBe(4);
});

test("MasterYi Q target death", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  yi1.action.q.level = 1;
  
  let hits = 0;
  yi2.interaction.onTakeDamage(() => hits += 1);

  const res = yi1.action.q.cast(yi2);
  yi2.dead = true;
  yi2.dead = false;
  expect(await res).toBe(false);
  expect(hits).toBe(0);
  expect(sim.time).toBe(0);

  await sim.waitFor(3000);
  expect(hits).toBe(0);
});

test("MasterYi src death", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  yi1.action.q.level = 1;
  
  let hits = 0;
  yi2.interaction.onTakeDamage(() => hits += 1);

  const res = yi1.action.q.cast(yi2);
  yi1.dead = true;
  yi1.dead = false;
  expect(await res).toBe(false);
  expect(hits).toBe(0);
  expect(sim.time).toBe(0);

  await sim.waitFor(3000);
  expect(hits).toBe(0);
});

test("MasterYi Q crit", async () => {
  const sim = new Simulation().start(20000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  yi1.action.q.level = 1;
  
  let captured1 = 0;
  const cancel1 = yi2.interaction.onTakeDamage(({ value, src, type }) => {
    if (src !== yi1 || type !== DamageType.PHYSIC) return;
    captured1 += value;
  });
  expect(await yi1.action.q.cast(yi2)).toBe(true);
  expect(captured1).toBeGreaterThan(50);
  cancel1();

  yi1.crit = 100;

  let captured2 = 0;
  let crit = 0;
  const cancel2 = yi2.interaction.onTakeDamage(({ value, src, type, isCrit }) => {
    if (src !== yi1 || type !== DamageType.PHYSIC) return;
    captured2 += value;
    if (isCrit) crit += 1;
  });

  yi1.action.q.finishCooldown();
  expect(await yi1.action.q.cast(yi2)).toBe(true);
  expect(captured2).toBeGreaterThan(50);
  cancel2();

  expect(captured2).toBeGreaterThan(captured1);
  expect(crit).toBe(4);
});

test("MasterYi Q aa cooldown reduction", async () => {
  const sim = new Simulation().start(20000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  yi1.action.q.level = 1;
  
  await yi1.action.q.cast(yi2);
  const cd = yi1.action.q.remainingCooldown;
  await yi1.action.attack.cast(yi2);

  expect(yi1.action.q.remainingCooldown).toBe(cd - yi1.action.attack.castTime - 1000);
});

test("MasterYi Q range", async () => {
  const sim = new Simulation().start(20000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  yi1.action.q.level = 1;
  yi2.pos = yi1.pos + 1000;
  
  expect(await yi1.action.q.cast(yi2)).toBe(false);
  expect(sim.time).toBe(0);

  yi2.pos = 600;
  expect(await yi1.action.q.cast(yi2)).toBe(true);
  expect(yi1.distance(yi2)).toBe(75);
});