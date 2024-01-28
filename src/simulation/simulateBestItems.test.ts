import { MasterYi } from "../champions/MasterYi/MasterYi";
import { bootSymbol, boots } from "../items/boots";
import { onHitItems } from "../items/onHitItems";
import { simulateBestNextItem, simulateBestBoot, simulateBestNextItems } from "./simulateBestItems";


test("simulateBestNextItem", async () => {
  const result = await simulateBestNextItem((sim) => { 
    const yi = new MasterYi();
    yi.level = 9;
    return yi.init(sim);
  }, undefined, onHitItems);

  expect(result.length).toBeGreaterThanOrEqual(1);
  for (let i = 1; i < result.length; i += 1) {
    expect(result[i-1].result.dps1).toBeGreaterThan(result[i].result.dps1);
  }
});

test("simulateBestBoot", async () => {
  const result = await simulateBestBoot((sim) => { 
    const yi = new MasterYi();
    yi.level = 9;
    return yi.init(sim);
  });

  expect(result).toBeTruthy();
  if (result) {
    expect(result.item.uniqueGroup).toBe(bootSymbol);
    expect(result.item.type).toBe("finishedItem");
  }
});

test("simulateBestNextItems", async () => {
  const result1 = await simulateBestNextItems((sim) => { 
    const yi = new MasterYi();
    yi.level = 9;
    return yi.init(sim);
  }, 1, undefined, onHitItems, 10);

  expect(result1.length).toBeGreaterThanOrEqual(1);
  expect(result1.length).toBeLessThanOrEqual(10);

  const result3 = await simulateBestNextItems((sim) => { 
    const yi = new MasterYi();
    yi.level = 9;
    return yi.init(sim);
  }, 2, undefined, onHitItems, 10);

  expect(result3.length).toBeGreaterThanOrEqual(1);
  expect(result3.length).toBeLessThanOrEqual(10);

  const result2 = await simulateBestNextItems((sim) => { 
    const yi = new MasterYi();
    yi.level = 9;
    return yi.init(sim);
  }, 3, undefined, onHitItems, 10);

  expect(result2.length).toBeGreaterThanOrEqual(1);
  expect(result2.length).toBeLessThanOrEqual(10);
});