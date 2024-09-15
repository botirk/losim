import { Nunu } from "../champions/Nunu/Nunu";
import { Champion } from "../champions/champion/champion";
import { Simulate1v1Result, Simulation, simulate1v1 } from "./simulation";

export type SimulateDummyResult<TChampion extends Champion> = Simulate1v1Result<TChampion, Nunu>;

export const simulateDummy = <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion | void, dummyRunsAway = false, maxTime = 180*1000): Promise<SimulateDummyResult<TChampion> | void> => {
  return simulate1v1((sim) => {
    const champion = getChampion(sim);
    if (!champion) return;
    const championLogic = (champion: TChampion, nunu: Nunu) => champion.killDummy(nunu);

    const nunu = new Nunu();
    nunu.level = champion.level;
    nunu.init(sim);
    const nunuLogic = (nunu: Nunu, champion: TChampion) => { if (dummyRunsAway) return nunu.runAwayFromEnemyAsDummy(champion); }

    return [champion, championLogic, nunu, nunuLogic];
  }, maxTime);
}