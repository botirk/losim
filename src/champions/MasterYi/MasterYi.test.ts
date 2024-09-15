import { MasterYi, MasterYiE } from "./MasterYi";
import { Simulation } from "../../simulation/simulation";

test("MasterYi E unleveled", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.buffs).toHaveLength(0);
  expect(yi2.buffs).toHaveLength(0);

  let capturedAA = 0;
  let capturedOthers = 0;
  yi2.interaction.onTakeDamage((dmg, src) => {
    if (src != yi1) return;
    if (dmg === yi2.calcRawPhysicHit(yi1.ad)) {
      capturedAA += 1;
    } else {
      capturedOthers += 1;
    }
  });
  await yi1.action.attack.cast(yi2);
  expect(capturedAA).toBe(1);
  expect(capturedOthers).toBe(0);
});

test("MasterYi E leveled 1", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  yi1.action.e.setLevel(1);
  const yi2 = new MasterYi().init(sim);

  let capturedAA = 0;
  let capturedE = 0;
  let capturedOthers = 0;
  yi2.interaction.onTakeDamage((dmg, src) => {
    if (src != yi1) return;
    if (dmg === yi2.calcRawPhysicHit(yi1.ad)) {
      capturedAA += 1;
    } else if (dmg === 30) {
      capturedE += 1;
    } else {
      capturedOthers += 1;
    }
  });
  yi1.action.e.cast();
  await yi1.action.attack.cast(yi2);
  expect(capturedAA).toBe(1);
  expect(capturedE).toBe(1);
  expect(capturedOthers).toBe(0);
});

test("MasterYi E Buff", async () => {
  const sim = new Simulation().start(10000);
  const yi1 = new MasterYi().init(sim) as any;
  expect(yi1.buffs).toHaveLength(0);
  yi1.action.e.setLevel(1);
  expect(yi1.buffs).toHaveLength(0);
  expect(yi1.action.attack._onHitUnit).toHaveLength(0);
  yi1.action.e.cast();
  expect(yi1.action.attack._onHitUnit).toHaveLength(1);
  expect(yi1.buffs[0].name).toBe(MasterYiE.ename);
  await sim.waitFor(4999);
  expect(yi1.buffs).toHaveLength(1);
  expect(yi1.action.attack._onHitUnit).toHaveLength(1);
  await sim.waitFor(2);
  expect(yi1.buffs).toHaveLength(0);
  expect(yi1.action.attack._onHitUnit).toHaveLength(0);
});

test("MasterYi E Cd", async () => {
  const sim = new Simulation().start(20000);
  const yi1 = new MasterYi().init(sim);
  yi1.action.e.setLevel(1);
  expect(yi1.action.e.isCooldown).toBe(false);
  expect(yi1.action.e.remainingCooldown).toBe(0);
  yi1.action.e.cast();
  expect(yi1.action.e.remainingCooldown).toBe(14000);
  await sim.waitFor(7000);
  expect(yi1.action.e.remainingCooldown).toBe(7000);
  expect(yi1.action.e.isCooldown).toBe(true);
  await sim.waitFor(7001);
  expect(yi1.action.e.isCooldown).toBe(false);
  expect(yi1.action.e.remainingCooldown).toBe(0);
});