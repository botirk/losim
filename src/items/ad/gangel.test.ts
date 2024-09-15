import { MasterYi } from "../../champions/MasterYi/MasterYi";
import { Simulation } from "../../simulation/simulation";
import { god } from "../../unit/unit";
import { DamageType } from "../../unit/unitInteraction";
import { gangel } from "./gangel";


test("Experimental Hexplate", async () => {
  const sim = new Simulation().start(500000);
  const yi1 = new MasterYi().init(sim);
  
  expect(yi1.applyEquip(gangel)).toBe(true);
  yi1.interaction.takeDamage({src: god, type: DamageType.TRUE, value: 1000000 });
  expect(yi1.health).toBe(1);
  expect(yi1.isStunned.value).toBe(true);

  yi1.interaction.takeDamage({src: god, type: DamageType.TRUE, value: 1000000 });
  expect(yi1.health).toBe(1);

  yi1.interaction.takeDamage({src: god, type: DamageType.TRUE, value: 1000000 });
  expect(yi1.health).toBe(1);

  yi1.interaction.takeDamage({src: god, type: DamageType.TRUE, value: 1000000 });
  expect(yi1.health).toBe(1);

  await sim.waitFor(4001);

  expect(yi1.health).toBe(yi1.maxHealth / 2);
  expect(yi1.mana).toBe(yi1.maxMana);
  expect(yi1.isStunned.value).toBe(false);
});