import { Nunu } from "../champions/Nunu/Nunu";
import { Champion } from "../champions/champion/champion";
import { boot, bootSymbol } from "../items/boots/index";
import { isItem } from "../unit/equip";
import { Simulate1v1Config, Simulate1v1Result, Simulation, simulate1v1WithCrits } from "./simulation";

export type SimulateDummyResult<TChampion extends Champion> = Simulate1v1Result<TChampion, Nunu>;

export class SimulateDummyConfig extends Simulate1v1Config {
  dummyRunsAway = true;
}

export const simulateDummy = <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion | void, config = new SimulateDummyConfig()): Promise<SimulateDummyResult<TChampion> | void> => {
  return simulate1v1WithCrits((sim) => {
    const champion = getChampion(sim);
    if (!champion) return;
    const championLogic = (champion: TChampion, nunu: Nunu) => champion.killDummy(nunu);

    const nunu = new Nunu();
    if (champion.appliedEquips.some((e) => isItem(e) && e.uniqueGroup === bootSymbol)) nunu.applyEquip(boot);
    nunu.level = champion.level;
    nunu.init(sim);
    const nunuLogic = (nunu: Nunu, champion: TChampion) => { if (config.dummyRunsAway) return nunu.runAwayFromEnemyAsDummy(champion); }

    return [champion, championLogic, nunu, nunuLogic];
  }, config);
}