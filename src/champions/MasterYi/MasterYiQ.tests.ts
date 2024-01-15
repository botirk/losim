import { MasterYi } from "./MasterYi";
import { Simulation } from "../../simulation/simulation";
import { DamageType } from "../../unit/unitInteraction";

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

  await yi1.action.q.cast(yi2);
  expect(count).toBe(4);
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
  yi2.action.attack.onHitUnit(() => onHits += 1);

  yi1.action.e.cast();
  await yi1.action.q.cast(yi2);
  expect(countP).toBe(4);
  expect(countT).toBe(4);
  expect(onHits).toBe(4);
});