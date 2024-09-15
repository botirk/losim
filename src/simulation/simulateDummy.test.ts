import { simulateDummy } from "./simulateDummy";
import { MasterYi } from "../champions/MasterYi/MasterYi";

test("simulateDummy", async () => {
  const result = await simulateDummy((sim) => new MasterYi().init(sim));
  if (!result) {
    expect(result).toBeTruthy();
    return;
  }

  expect(result.winner).toBe(result.champion1);
  expect(result.dps1).toBeGreaterThan(25);
});

test("simulateDummy nunu runs away", async () => {
  const result = await simulateDummy((sim) => new MasterYi().init(sim), true, 180*1000);
  if (!result) {
    expect(result).toBeTruthy();
    return;
  }
  
  expect(result.dps1).toBeLessThan(25);
  expect(result.winner).toBe(result.champion1);
});