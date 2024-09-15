import { MasterYi } from "../champions/MasterYi/MasterYi";
import { Simulation } from "../simulation/simulation";
import { DamageType } from "./unitInteraction";

test("UnitInteraction.takeDamage", async () => {
  const sim = new Simulation().start(5000);
  const yi = new MasterYi().init(sim);
  
  expect(yi.health).toBe(yi.maxHealth);
  yi.interaction.takeDamage({ value: 100, src: yi, type: DamageType.TRUE });
  expect(yi.health).toBe(yi.maxHealth - 100);
});

test("UnitInteraction.onTakeDamage", async () => {
  const sim = new Simulation().start(5000);
  const yi = new MasterYi().init(sim);
  
  let proc = 0;
  expect(yi.health).toBe(yi.maxHealth);
  const remove1 = yi.interaction.onTakeDamage(({ value, src }) => {
    proc += 1;
    expect(value).toBe(100);
    expect(src).toBe(yi);
    expect(yi.health).toBe(yi.maxHealth - 100);
  });
  yi.interaction.takeDamage({ value: 100, src: yi, type: DamageType.TRUE });
  expect(proc).toBe(1);
  remove1();

  const remove2 = yi.interaction.onTakeDamage(({ value, src }) => {
    proc += 1;
    expect(value).toBe(125);
    expect(src).toBe(yi);
    expect(yi.health).toBe(yi.maxHealth - 100 - 125);
  });
  yi.interaction.takeDamage({ value: 125, src: yi, type: DamageType.TRUE });
  expect(proc).toBe(2);
  remove2();

  const remove3 = yi.interaction.onTakeDamage(({ value, src }) => {
    proc += 1;
    expect(value).toBe(yi.maxHealth - 100 - 125);
    expect(src).toBe(yi);
    expect(yi.health).toBe(0);
  });
  yi.interaction.takeDamage({ value: 10000, src: yi, type: DamageType.TRUE });
  expect(proc).toBe(3);
  remove3();
});

test('UnitInteraction.onTakedown', async () => {
  const sim = new Simulation().start(15000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  
  let counted = 0;
  let kills = 0;
  yi1.interaction.onTakedown((unit) => {
    if (unit === yi2) counted += 1;
  });
  yi1.interaction.onKill((unit) => {
    if (unit === yi2) kills += 1;
  });

  await yi1.action.attack.cast(yi2);
  await sim.waitFor(1000);
  yi2.interaction.takeDamage({ value: Infinity, src: yi2, type: DamageType.TRUE });
  expect(counted).toBe(1);
  expect(kills).toBe(0);
});

test('UnitInteraction.onKill', async () => {
  const sim = new Simulation().start(35000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  
  let counted = 0;
  yi1.interaction.onKill((unit) => {
    if (unit === yi2) counted += 1;
  });
  while (!yi2.dead.value) await yi1.action.attack.cast(yi2);

  expect(counted).toBe(1);
});

test("UnitInteraction.onTakeDamage type of damage", async () => {
  const sim = new Simulation().start(5000);
  const yi = new MasterYi().init(sim);
  yi.health = 30000;
  
  let magic = 0, physic = 0, truthy = 0;

  yi.interaction.onTakeDamage((e) => {
    if (e.type === DamageType.MAGIC && e.value === 35) {
      magic += 1;
    } else if (e.type === DamageType.PHYSIC && e.value === yi.interaction.calcDamageReduction({ value: 34, src: yi, type: DamageType.PHYSIC }).value) {
      physic += 1;
    } else if (e.type === DamageType.TRUE && e.value === 33) {
      truthy += 1;
    }
  });

  yi.interaction.takeDamage({ value: 35, type: DamageType.MAGIC, src: yi });
  yi.interaction.takeDamage({ value: 35, type: DamageType.MAGIC, src: yi });

  yi.interaction.takeDamage({ value: 34, type: DamageType.PHYSIC, src: yi });
  yi.interaction.takeDamage({ value: 34, type: DamageType.PHYSIC, src: yi });
  yi.interaction.takeDamage({ value: 34, type: DamageType.PHYSIC, src: yi });

  yi.interaction.takeDamage({ value: 33, type: DamageType.TRUE, src: yi  });
  yi.interaction.takeDamage({ value: 33, type: DamageType.TRUE, src: yi  });
  yi.interaction.takeDamage({ value: 33, type: DamageType.TRUE, src: yi  });
  yi.interaction.takeDamage({ value: 33, type: DamageType.TRUE, src: yi  });

  expect(magic).toBe(2);
  expect(physic).toBe(3);
  expect(truthy).toBe(4);
});

test("UnitInteraction.percentDamageReduction", async () => {
  const sim = new Simulation().start(5000);
  const yi = new MasterYi().init(sim);
  
  yi.interaction.percentDamageReduction((e) => {
    if (e.type === DamageType.MAGIC) {
      e.value /= 2;
    }
  });

  const e1 = yi.interaction.calcDamageReduction({ value: 100, src: yi, type: DamageType.MAGIC });
  const e2 = yi.interaction.calcDamageReduction({ value: 100, src: yi, type: DamageType.PHYSIC });

  expect(e1.value).toBe(50);
  expect(e2.value).toBeGreaterThan(50);
  expect(e2.value).toBeLessThan(100);

  let phys = 0;
  let magic = 0;
  yi.interaction.onTakeDamage((e) => {
    if (e.type === DamageType.PHYSIC) phys += e.value;
    else if (e.type === DamageType.MAGIC) magic += e.value;
  });
  yi.interaction.takeDamage({ value: 100, src: yi, type: DamageType.MAGIC });
  yi.interaction.takeDamage({ value: 100, src: yi, type: DamageType.PHYSIC });

  expect(phys).toBeGreaterThan(50);
  expect(phys).toBeLessThan(100);
  expect(magic).toBe(50);
});

test("UnitInteraction armor calculation", async () => {
  const sim = new Simulation().start(5000);
  const yi = new MasterYi().init(sim);
  expect(yi.action.attack.calc(yi)).toBeLessThan(yi.ad);
});

test("UnitInteraction.heal", async () => {
  const sim = new Simulation().start(5000);
  const yi = new MasterYi().init(sim);
  yi.health = 1;
  
  yi.interaction.takeHeal({ src: yi, value: 50 });
  expect(yi.health).toBe(51);

  yi.dead.value = true;
  yi.health = 0;
  yi.interaction.takeHeal({ src: yi, value: 50 });
  expect(yi.health).toBe(0);
});

test("UnitInteraction.onTakeDamage 2", async () => {
  const sim = new Simulation().start(5000);
  const yi = new MasterYi().init(sim);

  yi.interaction.percentDamageReduction(e => {
    e.value /= 2;
  }) 

  yi.interaction.flatDamageReduction((e) => {
    e.value -= 50;
  });

  let count = 0;
  yi.interaction.onTakeDamage(e => {
    count = e.value;
  });

  yi.interaction.finalDamageReduction(e => {
    e.value -= 1;
  });

  yi.interaction.takeDamage({ src: yi, type: DamageType.TRUE, value: 100 });
  expect(count).toBe(24);
});