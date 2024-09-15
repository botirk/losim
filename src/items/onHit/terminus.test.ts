import { MasterYi } from "../../champions/MasterYi/MasterYi";
import { Simulation } from "../../simulation/simulation";
import { DamageType } from "../../unit/unitInteraction";
import { TerminusDarkBuff, TerminusLightBuff, terminus } from "./terminus";


test("Terminus", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  yi1.action.passive.disabled = true;
  expect(yi1.applyEquip(terminus)).toBe(true);
  const yi2 = new MasterYi().init(sim);
  yi2.bonusMr = 0;
  


  let magic = 0;
  yi2.interaction.onTakeDamage((e) => {
    if (e.src === yi1 && e.type === DamageType.MAGIC) magic += e.value;
  });


  const armor = yi1.armor, mr = yi2.mr;
  expect(yi1.armorPenPercent).toBe(0);
  expect(yi1.mrPenPercent).toBe(0);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.armor).toBe(armor + TerminusLightBuff.defense(yi1.level, 1));
  expect(yi1.mr).toBe(mr + TerminusLightBuff.defense(yi1.level, 1));
  expect(yi1.armorPenPercent).toBe(0);
  expect(yi1.mrPenPercent).toBe(0);
  expect(magic).toBe(30);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.armor).toBe(armor + TerminusLightBuff.defense(yi1.level, 1));
  expect(yi1.mr).toBe(mr + TerminusLightBuff.defense(yi1.level, 1));
  expect(yi1.armorPenPercent).toBe(TerminusDarkBuff.pen(1));
  expect(yi1.mrPenPercent).toBe(TerminusDarkBuff.pen(1));
  expect(magic).toBe(60);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.armor).toBe(armor + TerminusLightBuff.defense(yi1.level, 2));
  expect(yi1.mr).toBe(mr + TerminusLightBuff.defense(yi1.level, 2));
  expect(yi1.armorPenPercent).toBe(TerminusDarkBuff.pen(1));
  expect(yi1.mrPenPercent).toBe(TerminusDarkBuff.pen(1));
  expect(magic).toBe(90);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.armor).toBe(armor + TerminusLightBuff.defense(yi1.level, 2));
  expect(yi1.mr).toBe(mr + TerminusLightBuff.defense(yi1.level, 2));
  expect(yi1.armorPenPercent).toBe(TerminusDarkBuff.pen(2));
  expect(yi1.mrPenPercent).toBe(TerminusDarkBuff.pen(2));
  expect(magic).toBe(120);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.armor).toBe(armor + TerminusLightBuff.defense(yi1.level, 3));
  expect(yi1.mr).toBe(mr + TerminusLightBuff.defense(yi1.level, 3));
  expect(yi1.armorPenPercent).toBe(TerminusDarkBuff.pen(2));
  expect(yi1.mrPenPercent).toBe(TerminusDarkBuff.pen(2));
  expect(magic).toBe(150);

  yi2.health = yi2.maxHealth;

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.armor).toBe(armor + TerminusLightBuff.defense(yi1.level, 3));
  expect(yi1.mr).toBe(mr + TerminusLightBuff.defense(yi1.level, 3));
  expect(yi1.armorPenPercent).toBe(TerminusDarkBuff.pen(3));
  expect(yi1.mrPenPercent).toBe(TerminusDarkBuff.pen(3));
  expect(magic).toBe(180);

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.armor).toBe(armor + TerminusLightBuff.defense(yi1.level, 4));
  expect(yi1.mr).toBe(mr + TerminusLightBuff.defense(yi1.level, 4));
  expect(yi1.armorPenPercent).toBe(TerminusDarkBuff.pen(3));
  expect(yi1.mrPenPercent).toBe(TerminusDarkBuff.pen(3));

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.armor).toBe(armor + TerminusLightBuff.defense(yi1.level, 4));
  expect(yi1.mr).toBe(mr + TerminusLightBuff.defense(yi1.level, 4));
  expect(yi1.armorPenPercent).toBe(TerminusDarkBuff.pen(4));
  expect(yi1.mrPenPercent).toBe(TerminusDarkBuff.pen(4));

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.armor).toBe(armor + TerminusLightBuff.defense(yi1.level, 5));
  expect(yi1.mr).toBe(mr + TerminusLightBuff.defense(yi1.level, 5));
  expect(yi1.armorPenPercent).toBe(TerminusDarkBuff.pen(4));
  expect(yi1.mrPenPercent).toBe(TerminusDarkBuff.pen(4));

  yi2.health = yi2.maxHealth;

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.armor).toBe(armor + TerminusLightBuff.defense(yi1.level, 5));
  expect(yi1.mr).toBe(mr + TerminusLightBuff.defense(yi1.level, 5));
  expect(yi1.armorPenPercent).toBe(TerminusDarkBuff.pen(5));
  expect(yi1.mrPenPercent).toBe(TerminusDarkBuff.pen(5));
  
  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.armor).toBe(armor + TerminusLightBuff.defense(yi1.level, 5));
  expect(yi1.mr).toBe(mr + TerminusLightBuff.defense(yi1.level, 5));
  expect(yi1.armorPenPercent).toBe(TerminusDarkBuff.pen(5));
  expect(yi1.mrPenPercent).toBe(TerminusDarkBuff.pen(5));

  expect(await yi1.action.attack.cast(yi2)).toBe(true);
  expect(yi1.armor).toBe(armor + TerminusLightBuff.defense(yi1.level, 5));
  expect(yi1.mr).toBe(mr + TerminusLightBuff.defense(yi1.level, 5));
  expect(yi1.armorPenPercent).toBe(TerminusDarkBuff.pen(5));
  expect(yi1.mrPenPercent).toBe(TerminusDarkBuff.pen(5));

  await sim.waitFor(5001);
  expect(yi1.armor).toBe(armor);
  expect(yi1.mr).toBe(mr);
  expect(yi1.armorPenPercent).toBe(0);
  expect(yi1.mrPenPercent).toBe(0);
});