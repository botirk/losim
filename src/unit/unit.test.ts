import { MasterYi } from "../champions/MasterYi/MasterYi";
import { Simulation } from "../simulation/simulation";
import { Equip } from "./equip";

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

  const armor = yi.armor;

  const maxHealth = yi.maxHealth;
  const maxMana = yi.maxMana;

  const bonusMs = yi.bonusMs;
 
  const item: Equip = { type: "item", name: "test", bonusAs: 50, bonusAd: 50, crit: 50, bonusCritDamage: 50, armor: 50, maxHealth: 50, maxMana: 50, bonusMs: 50 };
  expect(yi.applyEquip(item)).toBe(true);

  expect(yi.bonusAs.value).toBe(bonusAs + 50);
  expect(yi.bonusAd).toBe(bonusAd + 50);
  expect(yi.crit).toBe(crit + 50);
  expect(yi.bonusCritDamage).toBe(bonusCritDamage + 50);

  expect(yi.armor).toBe(armor + 50);

  expect(yi.maxHealth).toBe(maxHealth + 50);
  expect(yi.maxMana).toBe(maxMana + 50);
  
  expect(yi.bonusMs).toBe(bonusMs + 50);
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
  const item: Equip = { type: "item", name: "test", maxHealth: 50, unique: true };
  expect(yi.applyEquip(item)).toBe(true);
  expect(yi.applyEquip(item)).toBe(false);
  expect(yi.maxHealth).toBe(sMaxHealth + 50);
});

test("Unit.applyEquip uniqueGroup", () => {
  const yi = new MasterYi().init();

  const sMaxHealth = yi.maxHealth;
  const item: Equip = { type: "item", name: "test", maxHealth: 50, uniqueGroup: Symbol() };
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
