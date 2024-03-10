import { MasterYi } from "../champions/MasterYi/MasterYi";
import { onHit } from "../items/onHit/index";
import { BestEquipsConfig, simulateBestNextItems, simulateBestNextSetup } from "./simulateEquips";

test("simulateBestNextItems", async () => {
  const config = new BestEquipsConfig();
  config.itemsToLook = onHit;
  config.count = 2;
  config.champ1 = (sim) => new MasterYi().init(sim, undefined, 9);

  const result = await simulateBestNextItems(config);

  expect(result.length).toBeGreaterThanOrEqual(1);
}, 30000)

test("simulateBestNextSetup", async () => {
  const config = new BestEquipsConfig();
  config.itemsToLook = onHit;
  config.count = 1;
  config.champ1 = (sim) => new MasterYi().init(sim, undefined, 9);

  const result1 = await simulateBestNextSetup(config);
  
  expect(result1.length).toBeGreaterThanOrEqual(1);
  expect(result1.some(res => !!res.keystone)).toBeTruthy();
}, 15000);