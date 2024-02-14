import { Simulation } from "../../simulation/simulation";
import { witsend, witsendDamage } from "./witsend";
import { MasterYi } from "../../champions/MasterYi/index"
import { DamageType } from "../../unit/unitInteraction";

test("Witsend", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  expect(yi1.applyEquip(witsend)).toBe(true);
  const yi2 = new MasterYi().init(sim);
  expect(witsendDamage(yi1)).toBe(15);

  yi1.level = 6;
  expect(witsendDamage(yi1)).toBe(15);

  yi1.level = 12;
  expect(witsendDamage(yi1)).toBe(55);

  yi1.level = 17;
  expect(witsendDamage(yi1)).toBe(78.75);

  let magic = 0;
  yi2.interaction.onTakeDamage((e) => {
    if (e.src === yi1 && e.type === DamageType.MAGIC && e.value >= 50) magic += 1;
  });
  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(magic).toBe(1);
});