import { MasterYi } from "./MasterYi";
import { Simulation } from "../../simulation/simulation";
import { DamageType } from "../../unit/unitInteraction";
import { MasterYiPassiveBuff } from "./MasterYiPassive";


test("MasterYi Passive", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  const yi2 = new MasterYi().init(sim);

  let passiveApplied = 0;
  let onHits = 0;
  yi2.interaction.onTakeDamage(({ value, src }) => {
    if (src === yi1 && value === yi2.interaction.calcPercentDamageReduction({ value: yi1.ad / 2, src: yi1, type: DamageType.PHYSIC }).value) passiveApplied += 1;
  });
  yi1.action.attack.onHitUnit((t) => {
    if (t === yi2) onHits += 1;
  });

  expect(yi1.action.passive.buff).toBe(undefined);
  await yi1.action.attack.cast(yi2);
  expect(onHits).toBe(1);
  expect(passiveApplied).toBe(0);
  expect(yi1.action.passive.buff).toBeInstanceOf(MasterYiPassiveBuff);
  expect(yi1.action.passive.buff?.stacks).toBe(1);
  await yi1.action.attack.cast(yi2);
  expect(passiveApplied).toBe(0);
  expect(onHits).toBe(2);
  expect(yi1.action.passive.buff?.stacks).toBe(2);
  await yi1.action.attack.cast(yi2);
  expect(passiveApplied).toBe(1);
  expect(onHits).toBe(4);
  expect(yi1.action.passive.buff).toBeInstanceOf(MasterYiPassiveBuff);
  expect(yi1.action.passive.buff?.stacks).toBe(1);
  await yi1.action.attack.cast(yi2);
  await yi1.action.attack.cast(yi2);
  expect(passiveApplied).toBe(2);
});