import { MasterYi } from "../champions/MasterYi/MasterYi";
import { boots } from "../items/boots";
import { onHitItems } from "../items/onHitItems";
import { simulateBestFirstItemSetup, simulateBestFirstItemSetupWithBoots } from "./simulateBestFirstItem";


test("simulateBestFirstItem", async () => {
  const result = await simulateBestFirstItemSetup((sim) => { 
    const yi = new MasterYi();
    yi.level = 9;
    return yi.init(sim);
  }, undefined, onHitItems);

  expect(result.length).toBeGreaterThanOrEqual(1);
  for (let i = 1; i < result.length; i += 1) {
    expect(result[i-1].result.dps1).toBeGreaterThan(result[i].result.dps1);
  }
});

test("simulateBestFirstItemWithBoots", async () => {
  const result = await simulateBestFirstItemSetupWithBoots((sim) => { 
    const yi = new MasterYi();
    yi.level = 9;
    return yi.init(sim);
  }, undefined, [...onHitItems, ...boots]);

  expect(result.length).toBeGreaterThanOrEqual(1);
  for (let i = 1; i < result.length; i += 1) {
    expect(result[i-1].result.dps1).toBeGreaterThan(result[i].result.dps1);
  }
});