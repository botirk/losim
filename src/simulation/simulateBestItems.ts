import { Champion } from "../champions/champion/champion";
import { Simulation } from "./simulation";
import { SimulateDummyResult, simulateDummy } from "./simulateDummy";
import { items } from "../items/items"
import { bootSymbol } from "../items/boots";
import { Equip } from "../unit/equip";

export interface BestNextItem<TChampion extends Champion> {
  item: Equip,
  result: SimulateDummyResult<TChampion>,
}

export class BestNextItemConfig {
  dummyRunsAway = false; 
  itemsToLook = items; 
  maxResults = 10;
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
    return this.equipExists(champion.appliedEquips.filter((e) => e.type === "finishedItem" || e.type === "item"));
  }
  addChampion(champion: Champion) {
    return this.equipAddToSimulated(champion.appliedEquips.filter((e) => e.type === "finishedItem" || e.type === "item"));
  }
  resetSimulatedItems() {
    this.simulatedItems = {};
  }
}


export const simulateBestNextItem = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion | void, config = new BestNextItemConfig()): Promise<BestNextItem<TChampion>[]> => {
  const results: BestNextItem<TChampion>[] = [];
  
  for (const item of config.itemsToLook) {
    const result = await simulateDummy<TChampion>((sim) => {
      const champ = getChampion(sim);
      if (champ && champ.applyEquip(item) && !config.championExists(champ)) return champ;
    }, config.dummyRunsAway);
    if (result) {
      config.addChampion(result.champion1);
      results.push({ item, result });
      results.sort((a, b) => a.result.ttk - b.result.ttk);
      results.splice(config.maxResults);
    }
  }

  return results;
}

export const simulateBestBoot = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion | void, config = new BestNextItemConfig()): Promise<BestNextItem<TChampion> | void> => {
  config.itemsToLook = config.itemsToLook.filter((item) => item.uniqueGroup === bootSymbol && item.type === "finishedItem")
  return (await simulateBestNextItem(getChampion, config))[0];
}

export interface BestNextItems<TChampion extends Champion> {
  items: Equip[],
  result: SimulateDummyResult<TChampion>,
}

export const simulateBestNextItems = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion | void, count: number, config = new BestNextItemConfig()): Promise<BestNextItems<TChampion>[]> => {
  const result: BestNextItems<TChampion>[] = [];
  
  for (const preresult of await simulateBestNextItem(getChampion, config)) {
    // needs recursion
    if (count > 1) {
      const nextresults = await simulateBestNextItems((sim) => {
        const champ = getChampion(sim);
        if (champ && champ.applyEquip(preresult.item)) return champ;
      }, count - 1, config);

      if (nextresults.length === 0) {
        result.push({ items: [ preresult.item ], result: preresult.result });
      } else {
        for (const nextresult of nextresults) result.push({ items: [ preresult.item, ...nextresult.items  ], result: nextresult.result });
      }
    // no need for recursion
    } else {
      result.push({ items: [ preresult.item ], result: preresult.result });
    }
  }

  result.sort((a, b) => a.result.ttk - b.result.ttk).splice(config.maxResults);
  return result;
}