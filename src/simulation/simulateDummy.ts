import { Nunu } from "../champions/Nunu/Nunu";
import { Champion } from "../champions/champion/champion";
import { boot, bootSymbol } from "../items/boots/index";
import { isItem } from "../unit/equip";
import { Simulate1v1Config, Simulate1v1Result, Simulation, simulate1v1WithCrits } from "./simulation";

export type SimulateDummyResult<TChampion1 extends Champion> = Simulate1v1Result<TChampion1, Nunu>;

export class SimulateDummyConfig<TChampion1 extends Champion> extends Simulate1v1Config<TChampion1, Nunu> {
  dummyRunsAway = true;
}

export const simulateDummy = <TChampion1 extends Champion>(config = new SimulateDummyConfig<TChampion1>()): Promise<SimulateDummyResult<TChampion1> | void> => {
  config.logic1 = (c1, c2) => {
    return c1.killDummy(c2);
  }
  config.champ2 = (sim) => {
    const champion = config.champ1(sim);
    if (!champion) return;

    const nunu = new Nunu();
    if (champion.appliedEquips.some((e) => isItem(e) && e.uniqueGroup === bootSymbol)) nunu.applyEquip(boot);
    nunu.level = champion.level;
    nunu.init(sim);
    return nunu;
  }
  config.logic2 = (c1, c2) => {
    if (config.dummyRunsAway) return c1.runAwayFromEnemyAsDummy(c2);
  }
  return simulate1v1WithCrits<TChampion1, Nunu>(config);
}