import { Nunu } from "../champions/Nunu/Nunu";
import { Champion } from "../champions/champion/champion";
import { Simulation } from "./simulation";

type TimeToKill = number;
type DPS = number;

interface SimulateDummyResult<TChampion extends Champion> {
  ttk: TimeToKill,
  dps: DPS;
  distance: number,
  isDummyDead: boolean,
  champion: TChampion,
  nunu: Nunu,
}

export const simulateDummy = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion, nunuRunsAway = false, maxTime = 180*1000): Promise<SimulateDummyResult<TChampion>> => {
  const sim = new Simulation();
  const champion = getChampion(sim);
  const nunu = new Nunu();
  nunu.level = champion.level;
  nunu.init(sim);
  sim.start(maxTime);

  // count damage
  let damage = 0;
  nunu.interaction.onTakeDamage((e) => damage += e.value);
  
  // logic
  const nunuLogic = async () => {
    if (!nunuRunsAway) return;
    while (!nunu.dead.value && !sim.isStopped) {
      const time = sim.time;
      await nunu.runAwayFromEnemyAsDummy(champion);
      if (sim.time === time) await sim.waitFor(sim.tickTime * 2);
    }
  }
  const champLogic = async () => {
    while (!nunu.dead.value && !sim.isStopped) {
      const time = sim.time;
      await champion.killDummy(nunu);
      if (sim.time === time) await sim.waitFor(sim.tickTime * 2);
    }
  }

  // sim
  await Promise.all([ champLogic(), nunuLogic() ]);

  // stats
  return {
    ttk: sim.time,
    dps: damage / (sim.time / 1000),
    distance: Math.abs(nunu.pos - champion.pos),
    isDummyDead: nunu.dead.value,
    champion,
    nunu,
  };
}