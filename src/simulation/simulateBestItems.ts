import { Champion } from "../champions/champion/champion";
import { Simulation } from "./simulation";
import { SimulateDummyConfig, SimulateDummyResult, simulateDummy } from "./simulateDummy";
import { items } from "../items/index";
import { bootSymbol } from "../items/boots/index";
import { Equip, isItem } from "../unit/equip";

export interface BestNextItem<TChampion extends Champion> {
  equip: Equip,
  result: SimulateDummyResult<TChampion>,
}

export class BestNextItemConfig extends SimulateDummyConfig {
  width = 10;
  equipToLook = items;
  simulatedItems: { [key: string]: boolean } = {};
  equipToString(equip: Equip[]) {
    return equip.concat().sort((a,b) => a.name.localeCompare(b.name)).reduce((result, cur) => result + " " + cur.name, "");
  }
  equipAddToSimulated(equip: Equip[]) {
    this.simulatedItems[this.equipToString(equip)] = true;
  }
  equipExists(equip: Equip[]): Boolean {
    return !!this.simulatedItems[this.equipToString(equip)];
  }
  championExists(champion: Champion) {
    return this.equipExists(champion.appliedEquips);
  }
  addChampion(champion: Champion) {
    return this.equipAddToSimulated(champion.appliedEquips);
  }
  resetSimulatedItems() {
    this.simulatedItems = {};
  }
}

export const simulateBestNextItem = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion | void, config = new BestNextItemConfig()): Promise<BestNextItem<TChampion>[]> => {
  const results: BestNextItem<TChampion>[] = [];
  
  for (const item of config.equipToLook) {
    const result = await simulateDummy<TChampion>((sim) => {
      const champ = getChampion(sim);
      if (champ && champ.applyEquip(item) && !config.championExists(champ)) return champ;
    }, config);
    if (result) {
      config.addChampion(result.champion1);
      results.push({ equip: item, result });
      if (config.sustain1) {
        results.sort((a, b) => b.result.damage1 - a.result.damage1);
      } else {
        results.sort((a, b) => a.result.ttk - b.result.ttk);
      }
    }
  }

  return results;
}

export const simulateBestBoot = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion | void, config = new BestNextItemConfig()): Promise<BestNextItem<TChampion> | void> => {
  config.equipToLook = config.equipToLook.filter((item) => isItem(item) && item.uniqueGroup === bootSymbol && item.isFinished === true);
  return (await simulateBestNextItem(getChampion, config))[0];
}

export interface BestNextItems<TChampion extends Champion> {
  equips: Equip[],
  result: SimulateDummyResult<TChampion>,
}

export const simulateBestNextItems = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion | void, count: number, config = new BestNextItemConfig()): Promise<BestNextItems<TChampion>[]> => {
  const results: BestNextItems<TChampion>[] = [];
  
  for (const preresult of (await simulateBestNextItem(getChampion, config)).slice(0, config.width)) {
    // needs recursion
    if (count > 1) {
      const nextresults = (await simulateBestNextItems((sim) => {
        const champ = getChampion(sim);
        if (champ && champ.applyEquip(preresult.equip)) return champ;
      }, count - 1, config));

      if (nextresults.length === 0) {
        results.push({ equips: [ preresult.equip ], result: preresult.result });
      } else {
        for (const nextresult of nextresults) results.push({ equips: [ preresult.equip, ...nextresult.equips  ], result: nextresult.result });
      }
    // no need for recursion
    } else {
      results.push({ equips: [ preresult.equip ], result: preresult.result });
    }
  }

  if (config.sustain1) {
    results.sort((a, b) => b.result.damage1 - a.result.damage1);
  } else {
    results.sort((a, b) => a.result.ttk - b.result.ttk);
  }
  return results;
}