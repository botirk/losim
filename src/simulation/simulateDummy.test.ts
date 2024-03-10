import { SimulateDummyConfig, simulateDummy } from "./simulateDummy";
import { MasterYi } from "../champions/MasterYi/MasterYi";

test("simulateDummy", async () => {
  const conf = new SimulateDummyConfig();
  conf.dummyRunsAway = false;
  const result = await simulateDummy(conf);
  if (!result) {
    expect(result).toBeTruthy();
    return;
  }

  expect(result.winner).toBe(result.champion1);
  expect(result.dps1).toBeGreaterThan(25);
});

test("simulateDummy nunu runs away", async () => {
  const conf = new SimulateDummyConfig();
  conf.dummyRunsAway = true;
  const result = await simulateDummy(conf);
  if (!result) {
    expect(result).toBeTruthy();
    return;
  }
  
  expect(result.dps1).toBeLessThan(25);
  expect(result.winner).toBe(result.champion1);
});