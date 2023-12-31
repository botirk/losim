import { MasterYi, MasterYiE, MasterYiPassiveBuff, MasterYiR } from "./MasterYi";
import { Simulation } from "../../simulation/simulation";
import { DamageType } from "../../unit/unitInteraction";

test("MasterYi E unleveled", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.buffs).toHaveLength(0);
  expect(yi2.buffs).toHaveLength(0);
  expect(yi1.action.e.isCancelableByUser).toBe(false);

  let capturedAA = 0;
  let capturedOthers = 0;
  yi2.interaction.onTakeDamage(({ value, src }) => {
    if (src != yi1) return;
    if (value === yi1.action.attack.calc(yi2)) {
      capturedAA += 1;
    } else {
      capturedOthers += 1;
    }
  });
  yi1.action.e.cast();
  expect(yi1.action.e.isCasting).toBe(false);
  expect(yi1.action.e.isCooldown).toBe(false);
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
  yi2.interaction.onTakeDamage(({ value, src }) => {
    if (src != yi1) return;
    if (value === yi1.action.attack.calc(yi2)) {
      capturedAA += 1;
    } else if (value === 30) {
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
  const yi1 = new MasterYi().init(sim);
  expect(yi1.buffs).toHaveLength(0);
  yi1.action.e.setLevel(1);
  expect(yi1.buffs).toHaveLength(0);
  yi1.action.e.cast();
  expect(yi1.buffs[0].name).toBe(MasterYiE.ename);
  await sim.waitFor(4999);
  expect(yi1.buffs).toHaveLength(1);
  await sim.waitFor(2);
  expect(yi1.buffs).toHaveLength(0);
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

test("MasterYi R unleveled", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  expect(yi1.buffs).toHaveLength(0);
  expect(yi2.buffs).toHaveLength(0);
  expect(yi1.action.r.isCancelableByUser).toBe(false);
  yi1.action.r.cast();
  expect(yi1.action.r.isCasting).toBe(false);
  expect(yi1.action.r.isCooldown).toBe(false);
  expect(yi1.buffs).toHaveLength(0);
  expect(yi1.bonusAs).toBe(0);
});

test("MasterYi R levels(as)", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);

  yi1.action.r.setLevel(1);
  yi1.action.r.cast();
  expect(yi1.buffs).toHaveLength(1);
  expect(yi1.bonusAs).toBe(25);

  await yi1.action.r.waitForCooldown();
  expect(yi1.bonusAs).toBe(0);
  yi1.action.r.setLevel(2);
  yi1.action.r.cast();
  expect(yi1.buffs).toHaveLength(1);
  expect(yi1.bonusAs).toBe(35);

  await yi1.action.r.waitForCooldown();
  expect(yi1.bonusAs).toBe(0);
  yi1.action.r.setLevel(3);
  yi1.action.r.cast();
  expect(yi1.buffs).toHaveLength(1);
  expect(yi1.bonusAs).toBe(45);

  await yi1.action.r.waitForCooldown();
  expect(yi1.bonusAs).toBe(0);
  yi1.action.r.setLevel(5);
  yi1.action.r.cast();
  expect(yi1.buffs).toHaveLength(1);
  expect(yi1.bonusAs).toBe(45);

  await yi1.action.r.waitForCooldown();
  expect(yi1.bonusAs).toBe(0);
});

test("MasterYi R Buff", async () => {
  const sim = new Simulation().start(10000);
  const yi1 = new MasterYi().init(sim);
  expect(yi1.buffs).toHaveLength(0);
  yi1.action.r.setLevel(1);
  expect(yi1.buffs).toHaveLength(0);
  yi1.action.r.cast();
  expect(yi1.buffs[0].name).toBe(MasterYiR.rname);
  await sim.waitFor(6999);
  expect(yi1.buffs).toHaveLength(1);
  await sim.waitFor(2);
  expect(yi1.buffs).toHaveLength(0);
});

test("MasterYi R Cd", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  yi1.action.r.setLevel(1);
  expect(yi1.action.r.isCooldown).toBe(false);
  expect(yi1.action.r.remainingCooldown).toBe(0);
  yi1.action.r.cast();
  expect(yi1.action.r.remainingCooldown).toBe(85000);
  await sim.waitFor(42500);
  expect(yi1.action.r.remainingCooldown).toBe(42500);
  expect(yi1.action.r.isCooldown).toBe(true);
  await sim.waitFor(42501);
  expect(yi1.action.r.isCooldown).toBe(false);
  expect(yi1.action.r.remainingCooldown).toBe(0);
});

test("MasterYi R Takedown", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  const yi3 = new MasterYi().init(sim);
  
  yi1.action.r.setLevel(1);
  
  await yi1.action.attack.cast(yi2);
  await sim.waitFor(10001);
  yi1.action.r.cast();
  expect(yi1.buffsNamed(MasterYiR.rname)[0].remainingTime).toBe(7000);
  yi2.interaction.takeDamage({ value: Infinity, src: yi2, type: DamageType.TRUE });
  expect(yi1.buffsNamed(MasterYiR.rname)[0].remainingTime).toBe(7000);

  await yi1.action.attack.cast(yi3);
  expect(yi1.buffsNamed(MasterYiR.rname)[0].isActive).toBe(true);
  const time = yi1.buffsNamed(MasterYiR.rname)[0].remainingTime;
  yi3.interaction.takeDamage({ value: Infinity, src: yi3, type: DamageType.TRUE });
  expect(yi1.buffsNamed(MasterYiR.rname)[0].remainingTime).toBe(time + 7000);
});

test("MasterYi Passive", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);

  let passiveApplied = 0;
  let onHits = 0;
  yi2.interaction.onTakeDamage(({ value, src }) => {
    if (src === yi1 && value === yi2.interaction.calcPercentDamageReduction({ value: yi1.ad / 2, src: yi1, type: DamageType.PHYSIC }).value) passiveApplied += 1;
  });
  yi1.action.attack.onHitUnit((t) => {
    if (t === yi2) onHits += 1;
  });

  expect(yi1.action.passive.buff).toBe(undefined);
  await yi1.action.attack.cast(yi2);
  expect(onHits).toBe(1);
  expect(passiveApplied).toBe(0);
  expect(yi1.action.passive.buff).toBeInstanceOf(MasterYiPassiveBuff);
  expect(yi1.action.passive.buff.stacks).toBe(1);
  await yi1.action.attack.cast(yi2);
  expect(passiveApplied).toBe(0);
  expect(onHits).toBe(2);
  expect(yi1.action.passive.buff.stacks).toBe(2);
  await yi1.action.attack.cast(yi2);
  expect(passiveApplied).toBe(1);
  expect(onHits).toBe(4);
  expect(yi1.action.passive.buff).toBeInstanceOf(MasterYiPassiveBuff);
  expect(yi1.action.passive.buff.stacks).toBe(1);
  await yi1.action.attack.cast(yi2);
  await yi1.action.attack.cast(yi2);
  expect(passiveApplied).toBe(2);
});

test("MasterYi W NoLevel", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);

  yi1.action.w.cast();
  expect(yi1.action.current).toBeFalsy();
});

test("MasterYi W just cast", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  
  yi1.action.w.setLevel(1);
  const prom = yi1.action.w.cast();
  expect(yi1.action.current).toBe(yi1.action.w);
  expect(yi1.action.w.isCasting).toBe(true);
  expect(yi1.action.w.remainingCast).toBe(4000);
  await prom;
  expect(sim.time).toBe(4000);
  expect(yi1.action.w.isCasting).toBe(false);
  expect(yi1.action.w.remainingCooldown).toBe(9000);
  expect(yi1.action.current).toBeFalsy();
});