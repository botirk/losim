import { Nunu } from "../champions/Nunu/Nunu";
import { Champion } from "../champions/champion/champion";
import { Simulation } from "./simulation";

type TimeToKill = number;
type DPS = number;

interface SimulateDummyResult {
  ttk: TimeToKill,
  dps: DPS;
}

export const simulateDummy = async (getChampion: (sim: Simulation) => Champion, nunuRunsAway = false, maxTime = 180*1000): Promise<SimulateDummyResult> => {
  const sim = new Simulation();
  const champ = getChampion(sim);
  const nunu = new Nunu();
  nunu.level = champ.level;
  nunu.init(sim);
  sim.start(maxTime);

  // count damage
  let damage = 0;
  nunu.interaction.onTakeDamage((e) => damage += e.value);
  
  // logic
  const nunuLogic = async () => {
    while (!nunu.dead && !sim.isStopped && nunuRunsAway) {
      const time = sim.time;
      await nunu.runAwayFromEnemyAsDummy(champ);
      if (sim.time === time) await sim.waitFor(sim.tickTime);
    }
  }
  const champLogic = async () => {
    while (!nunu.dead && !sim.isStopped) {
      const time = sim.time;
      await champ.killDummy(nunu);
      if (sim.time === time) await sim.waitFor(sim.tickTime);
    }
  } 

  // sim
  await Promise.all([ champLogic(), nunuLogic() ]);

  // stats
  return {
    ttk: sim.time,
    dps: damage / (sim.time / 1000),
  };
}