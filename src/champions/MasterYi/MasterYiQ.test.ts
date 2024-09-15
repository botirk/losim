import { MasterYi } from "./MasterYi";
import { Simulation } from "../../simulation/simulation";
import { DamageType } from "../../unit/unitInteraction";
import { MasterYiQ, MasterYiQMark } from "./MasterYiQ";

test("MasterYi Q NoLvL", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  
  await yi1.action.q.cast(yi2);
  expect(yi1.action.q.isCooldown).toBe(false);

  yi1.action.q.level = 1;
  const prom = yi1.action.q.cast(yi2);
  expect(yi1.action.q.remainingCooldown).toBe(20000);
  await prom;
  expect(yi1.action.q.isCooldown).toBe(true);
});

test("MasterYi Q Targetable", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  yi1.action.q.level = 1;

  yi1.action.q.cast(yi2);
  for (let i = 0; i < 4 * 231; i += 10) {
    expect(yi1.targetable).toBe(false);
    await sim.waitFor(10);
  }
  await sim.waitFor(200);
  expect(yi1.targetable).toBe(true);
});

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