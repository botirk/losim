import { simulateDummy } from "./simulateDummy";
import { MasterYi } from "../champions/MasterYi/MasterYi";

test("simulateDummy", async () => {
  const result = await simulateDummy((sim) => new MasterYi().init(sim));

  expect(result.isDummyDead).toBe(true);
  expect(result.dps).toBeGreaterThan(25);
});

test("simulateDummy nunu runs away", async () => {
  const result = await simulateDummy((sim) => new MasterYi().init(sim), true, 180*1000);
  
  expect(result.isDummyDead).toBe(false);
});