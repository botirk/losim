import { MasterYi } from "../champions/MasterYi/MasterYi";
import { bootSymbol } from "../items/boots/index";
import { onHit } from "../items/onHit/index";
import { isItem } from "../unit/equip";
import { simulateBestNextItem, simulateBestBoot, BestEquipConfig, simulateBestNextKeystone } from "./simulateEquip";

test("simulateBestNextItem", async () => {
  const config = new BestEquipConfig();
  config.itemsToLook = onHit;
  config.champ1 = (sim) => new MasterYi().init(sim, undefined, 9);
  
  const result = await simulateBestNextItem(config);

  expect(result.length).toBeGreaterThanOrEqual(1);
  for (let i = 1; i < result.length; i += 1) {
    expect(result[i-1].result.ttk).toBeLessThan(result[i].result.ttk);
  }
});

test("simulateBestNextItem sustain", async () => {
  const config = new BestEquipConfig();
  config.itemsToLook = onHit;
  config.sustain1 = true;
  config.champ1 = (sim) => new MasterYi().init(sim, undefined, 9);

  const result = await simulateBestNextItem(config);

  expect(result.length).toBeGreaterThanOrEqual(1);
  for (let i = 1; i < result.length; i += 1) {
    expect(result[i-1].result.damage1).toBeGreaterThan(result[i].result.damage1);
  }
});

test("simulateBestBoot", async () => {
  const config = new BestEquipConfig();
  config.champ1 = (sim) => new MasterYi().init(sim, undefined, 9);
  const result = await simulateBestBoot();

  expect(result).toBeTruthy();
  expect(result && isItem(result[0].items[0])).toBe(true);
  if (result && isItem(result[0].items[0])) {
    expect(result[0].items[0].uniqueGroup).toBe(bootSymbol);
    expect(result[0].items[0].isFinished).toBe(true);
  }
});

test("simulateBestNextKeystone", async () => {
  const config = new BestEquipConfig();
  config.itemsToLook = onHit;
  config.champ1 = (sim) => new MasterYi().init(sim, undefined, 9);

  const result1 = await simulateBestNextKeystone(config);
  expect(result1.length).toBeGreaterThanOrEqual(1);
  expect(result1[0].keystone).toBeTruthy();
});

