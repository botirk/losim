import { MasterYi } from "../champions/MasterYi/MasterYi";
import { bootSymbol } from "../items/boots/index";
import { onHit } from "../items/onHit/index";
import { isItem } from "../unit/equip";
import { simulateBestNextItem, simulateBestBoot, simulateBestNextItems, BestNextItemConfig, simulateBestNextSetup, simulateBestNextKeystone } from "./simulateEquip";

test("simulateBestNextItem", async () => {
  const config = new BestNextItemConfig();
  config.itemsToLook = onHit;

  const result = await simulateBestNextItem((sim) => { 
    const yi = new MasterYi();
    yi.level = 9;
    return yi.init(sim);
  }, config);

  expect(result.length).toBeGreaterThanOrEqual(1);
  for (let i = 1; i < result.length; i += 1) {
    expect(result[i-1].result.ttk).toBeLessThan(result[i].result.ttk);
  }
});

test("simulateBestNextItem sustain", async () => {
  const config = new BestNextItemConfig();
  config.itemsToLook = onHit;
  config.sustain1 = true;

  const result = await simulateBestNextItem((sim) => { 
    const yi = new MasterYi();
    yi.level = 9;
    return yi.init(sim);
  }, config);

  expect(result.length).toBeGreaterThanOrEqual(1);
  for (let i = 1; i < result.length; i += 1) {
    expect(result[i-1].result.damage1).toBeGreaterThan(result[i].result.damage1);
  }
});

test("simulateBestBoot", async () => {
  const result = await simulateBestBoot((sim) => { 
    const yi = new MasterYi();
    yi.level = 9;
    return yi.init(sim);
  });

  expect(result).toBeTruthy();
  expect(result && isItem(result[0].items[0])).toBe(true);
  if (result && isItem(result[0].items[0])) {
    expect(result[0].items[0].uniqueGroup).toBe(bootSymbol);
    expect(result[0].items[0].isFinished).toBe(true);
  }
});

test("simulateBestNextItems", async () => {
  const config = new BestNextItemConfig();
  config.itemsToLook = onHit;

  const result = await simulateBestNextItems((sim) => new MasterYi().init(sim, undefined, 9), 2, config);

  expect(result.length).toBeGreaterThanOrEqual(1);
}, 30000);

test("simulateBestNextKeystone", async () => {
  const config = new BestNextItemConfig();
  config.itemsToLook = onHit;

  const result1 = await simulateBestNextKeystone((sim) => { 
    const yi = new MasterYi();
    yi.level = 9;
    return yi.init(sim);
  }, config);
  expect(result1.length).toBeGreaterThanOrEqual(1);
  expect(result1[0].keystone).toBeTruthy();
});

test("simulateBestNextSetup", async () => {
  const config = new BestNextItemConfig();
  config.itemsToLook = onHit;

  const result1 = await simulateBestNextSetup((sim) => { 
    const yi = new MasterYi();
    yi.level = 9;
    return yi.init(sim);
  }, 1, config);
  expect(result1.length).toBeGreaterThanOrEqual(1);
  expect(result1.some(res => !!res.keystone)).toBeTruthy();
}, 15000);