import { Simulation } from "../../simulation/simulation";
import { MasterYi } from "../../champions/MasterYi";
import { ehexplate } from "./ehexplate";
import { MasterYiR } from "../../champions/MasterYi/MasterYiR";

test("Experimental Hexplate", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  yi1.action.r.level = 1;
  const cd = yi1.action.r.cooldownTime;
  expect(cd).toBeGreaterThan(20000);
  expect(yi1.applyEquip(ehexplate)).toBe(true);
  expect(yi1.action.r.cooldownTime).toBeLessThan(cd);
  expect(await yi1.action.r.cast());

  expect(yi1.mMs).toBeGreaterThan(MasterYiR.bonusMMs(1));
  expect(yi1.bonusAs.value).toBeGreaterThan(MasterYiR.bonusAs(1));

  const mmS = yi1.mMs;
  const bas = yi1.bonusAs.value;

  yi1.action.r.finishCooldown();
  expect(await yi1.action.r.cast());
  expect(yi1.mMs).toBe(mmS);
  expect(yi1.bonusAs.value).toBe(bas);

  await sim.waitFor(10000);
  expect(yi1.mMs).toBe(1);
  expect(yi1.bonusAs.value).toBe(25);
});