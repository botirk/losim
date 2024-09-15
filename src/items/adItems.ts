import { MasterYi } from "../champions/MasterYi/MasterYi";
import { MasterYiR } from "../champions/MasterYi/MasterYiR";
import { Simulation } from "../simulation/simulation";
import { TimedBuff } from "../unit/buff";
import { Equip } from "../unit/equip";
import { Unit } from "../unit/unit";

export class EHexplateBuff extends TimedBuff {
  constructor(owner: Unit) {
    super(ehexplate.name, owner, 8000, true);
    owner.mMs *= 1.15;
    owner.bonusAs.value += 35;
  }

  fade(): void {
    if (!this.isActive) return;
    this.owner.mMs /= 1.15;
    this.owner.bonusAs.value -= 35;
    super.fade();
  }
}

export const ehexplate: Equip = {
  name: "Experimental Hexplate",
  type: "finishedItem",
  bonusAd: 55,
  bonusAs: 25,
  maxHealth: 300,
  apply: (unit) => {
    const ult = unit.action.r;
    if (ult && ult.maxLevel !== unit.action?.q.maxLevel) {
      ult.abilityHaste += 30;
      let lastActivation = -Infinity;
      ult.onCast(() => {
        if (lastActivation + 30000 <= unit.sim.time) {
          lastActivation = unit.sim.time;
          new EHexplateBuff(unit);
        }
      });
    }
  },
  test: () => {
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
  }
}

export const adItems: Equip[] = [
  ehexplate,
];