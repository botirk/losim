import { MasterYi } from "../champions/MasterYi/MasterYi";
import { Simulation } from "../simulation/simulation";
import { Equip, Item, Keystone } from "./equip";

test("Unit.onBonusASChange", () => {
  const yi = new MasterYi().init();
  let changed = false;
  expect(yi.bonusAs.value).toBe(0);
  yi.bonusAs.callback(() => { changed = true; });
  yi.bonusAs.value = 1;
  expect(yi.bonusAs.value).toBe(1);
  expect(changed).toBe(true);
});

test("Unit.targetable", () => {
  const yi = new MasterYi().init();
  yi.targetable.value = false;
  yi.targetable.value = false;
  expect(yi.targetable.value).toBe(false);
  yi.targetable.value = true;
  expect(yi.targetable.value).toBe(false);
  yi.targetable.value = true;
  expect(yi.targetable.value).toBe(true);
  yi.dead.value = true;
  expect(yi.targetable.value).toBe(false);
});

test("Unit.onDeath", async () => {
  const sim = new Simulation().start(30000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);

  let proc = 0;
  yi2.dead.callback(() => {
    proc += 1;
  });

  while (!sim.isStopped && !yi2.dead.value) {
    await yi1.action.attack.cast(yi2);
  }
  expect(sim.isStopped).toBeFalsy();
  expect(sim.time).toBeLessThan(20000);
  expect(sim.time).toBeGreaterThan(5000);
  expect(yi2.dead.value).toBe(true);
  expect(yi2.health).toBe(0);
  expect(proc).toBe(1);
});

test("Unit.ad", () => {
  const yi = new MasterYi().init();
  expect(yi.ad).toBeGreaterThan(40);
  const ad = yi.ad;
  yi.bonusAd += 10;
  expect(yi.ad).toBe(ad + 10);
});

test("Unit.applyEquip simple stats", () => {
  const yi = new MasterYi().init();

  const bonusAs = yi.bonusAs.value;
  const bonusAd = yi.bonusAd;
  const crit = yi.crit;
  const bonusCritDamage = yi.bonusCritDamage;
  const lifesteal = yi.lifesteal;

  const armor = yi.bonusArmor;
  const mr = yi.bonusMr;

  const maxHealth = yi.maxHealth;
  const maxMana = yi.maxMana;

  const bonusMs = yi.bonusMs;
  const mMs = yi.mMs;

  const abilityHaste = yi.abilityHaste;
 
  const item: Equip = { type: "item", name: "test", bonusAs: 50, bonusAd: 50, crit: 50, bonusCritDamage: 50, armor: 50, maxHealth: 50, maxMana: 50, bonusMs: 50, lifesteal: 50, mr: 50, abilityHaste: 50, mMs: 1.5 };
  expect(yi.applyEquip(item)).toBe(true);

  expect(yi.bonusAs.value).toBe(bonusAs + 50);
  expect(yi.bonusAd).toBe(bonusAd + 50);
  expect(yi.crit).toBe(crit + 50);
  expect(yi.bonusCritDamage).toBe(bonusCritDamage + 50);
  expect(yi.lifesteal).toBe(lifesteal + 50);

  expect(yi.bonusArmor).toBe(armor + 50);
  expect(yi.bonusMr).toBe(mr + 50);

  expect(yi.maxHealth).toBe(maxHealth + 50);
  expect(yi.maxMana).toBe(maxMana + 50);
  
  expect(yi.mMs).toBe(mMs * 1.5);
  expect(yi.bonusMs).toBe(bonusMs + 50);
  expect(yi.abilityHaste).toBe(abilityHaste + 50);
});

test("Unit.applyEquip 7 items", () => {
  const yi = new MasterYi().init();

  const sMaxHealth = yi.maxHealth;
  const item: Equip = { type: "item", name: "test", maxHealth: 50 };
  expect(yi.applyEquip(item)).toBe(true);
  expect(yi.applyEquip(item)).toBe(true);
  expect(yi.applyEquip(item)).toBe(true);
  expect(yi.applyEquip(item)).toBe(true);
  expect(yi.applyEquip(item)).toBe(true);
  expect(yi.applyEquip(item)).toBe(true);
  expect(yi.applyEquip(item)).toBe(false);
  expect(yi.maxHealth).toBe(sMaxHealth + item.maxHealth * 6);
});

test("Unit.applyEquip unique", () => {
  const yi = new MasterYi().init();

  const sMaxHealth = yi.maxHealth;
  const item: Item = { type: "item", name: "test", maxHealth: 50, unique: true, isFinished: false };
  expect(yi.applyEquip(item)).toBe(true);
  expect(yi.applyEquip(item)).toBe(false);
  expect(yi.maxHealth).toBe(sMaxHealth + 50);
});

test("Unit.applyEquip uniqueGroup", () => {
  const yi = new MasterYi().init();

  const sMaxHealth = yi.maxHealth;
  const item: Item = { type: "item", name: "test", maxHealth: 50, uniqueGroup: Symbol(), isFinished: false };
  expect(yi.applyEquip(item)).toBe(true);
  expect(yi.applyEquip(item)).toBe(false);
  expect(yi.maxHealth).toBe(sMaxHealth + 50);
});

test("Unit.applyEquip apply", () => {
  const yi = new MasterYi().init();

  const sMaxHealth = yi.maxHealth;
  const item: Equip = { type: "item", name: "test", maxHealth: 50, apply: () => false };
  const item2: Equip = { type: "item", name: "test", apply: (u) => { u.maxHealth += 50; } };

  expect(yi.applyEquip(item)).toBe(false);
  expect(yi.maxHealth).toBe(sMaxHealth);

  expect(yi.applyEquip(item2)).toBe(true);
  expect(yi.maxHealth).toBe(sMaxHealth + 50);
});

test("Unit.team", () => {
  const sim = new Simulation().start(12000);
  const yi1 = new MasterYi().init(sim, "RED", 5);
  const yi2 = new MasterYi();

  yi2.level = 5;
  yi2.team = "RED";
  yi2.init(sim);

  expect(yi1.team).toBe("RED");
  expect(yi1.level).toBe(5);
});

test("Unit.ms cap", () => {
  const yi1 = new MasterYi().init();
  yi1.bonusMs = 10000;
  expect(yi1.ms).toBeLessThan(9000);

  yi1.bonusMs = -yi1.baseMs;
  expect(yi1.ms).toBe(110);

  yi1.bonusMs = -yi1.baseMs + 150;
  expect(yi1.ms).toBeGreaterThan(150);

  yi1.bonusMs = 0;
  yi1.mMs = 100;
  expect(yi1.ms).toBeGreaterThan(500);
});

test("Unit.applyEquip maxHealth", () => {
  const yi = new MasterYi().init();
  const item: Equip = { type: "item", name: "test", maxHealth: 50 };
  expect(yi.applyEquip(item)).toBe(true);
  expect(yi.health).toBe(yi.maxHealth);
});

test("Unit.applyEquip rune", () => {
  const yi = new MasterYi().init();
  const mh = yi.maxHealth;
  const key: Keystone = { path: "Domination", subtype: "Keystone", name: "test", type: "rune", maxHealth: 50 };
  expect(yi.applyEquip(key)).toBe(true);
  expect(yi.maxHealth).toBe(mh + 50);

  expect(yi.applyEquip(key)).toBe(false);
  expect(yi.maxHealth).toBe(mh + 50);
});

test("Unit isStunned", async () => {
  const sim = new Simulation().start(5000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);
  
  const prom = yi1.action.attack.cast(yi2);

  yi1.isStunned.value = true;
  expect(yi1.isStunned.value).toBe(true);
  expect(await prom).toBe(false);
  expect(await yi1.action.attack.cast(yi2)).toBe(false);
  expect(await yi1.action.move.cast(yi2.pos)).toBe(false);
  expect(yi1.isStunned.value).toBe(true);
  yi1.isStunned.value = false;
  expect(yi1.isStunned.value).toBe(false);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);

  expect(yi1.action.move.castable(0)).toBe(true);
  expect(yi1.action.attack.castable(yi2)).toBe(true);
  yi1.isStunned.value = true;
  expect(yi1.action.move.castable(0)).toBe(false);
  expect(yi1.action.attack.castable(yi2)).toBe(false);
});

