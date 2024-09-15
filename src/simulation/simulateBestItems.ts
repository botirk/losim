import { Champion } from "../champions/champion/champion";
import { Simulation } from "./simulation";
import { SimulateDummyResult, simulateDummy } from "./simulateDummy";
import { items } from "../items/items"
import { bootSymbol } from "../items/boots";
import { Equip } from "../unit/equip";

interface BestNextItem<TChampion extends Champion> {
  item: Equip,
  result: SimulateDummyResult<TChampion>,
}

export const simulateBestNextItem = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion | void, dummyRunsAway = false, itemsToLook = items, maxResults = 10): Promise<BestNextItem<TChampion>[]> => {
  const results: BestNextItem<TChampion>[] = [];
  
  for (const item of itemsToLook) {
    const result = await simulateDummy<TChampion>((sim) => {
      const champ = getChampion(sim);
      if (champ && champ.applyEquip(item)) return champ;
    }, dummyRunsAway);
    if (result) {
      results.push({ item, result });
      results.sort((a, b) => a.result.ttk - b.result.ttk);
      results.splice(maxResults);
    }
  }

  return results;
}

export const simulateBestBoot = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion | void, dummyRunsAway = false, itemsToLook = items, maxResults = 10): Promise<BestNextItem<TChampion> | void> => {
  return (await simulateBestNextItem(getChampion, dummyRunsAway, itemsToLook.filter((item) => item.uniqueGroup === bootSymbol && item.type === "finishedItem"), maxResults))[0];
}

interface BestNextItems<TChampion extends Champion> {
  items: Equip[],
  result: SimulateDummyResult<TChampion>,
}

export const simulateBestNextItems = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion | void, count: number, dummyRunsAway = false, itemsToLook = items, maxResults = 10): Promise<BestNextItems<TChampion>[]> => {
  const result: BestNextItems<TChampion>[] = [];
  
  for (const preresult of await simulateBestNextItem(getChampion, dummyRunsAway, itemsToLook, maxResults)) {
    if (count > 1) {
      const nextresults = await simulateBestNextItems((sim) => {
        const champ = getChampion(sim);
        if (champ && champ.applyEquip(preresult.item)) return champ;
      }, count - 1, dummyRunsAway, itemsToLook, maxResults);

      if (nextresults.length === 0) {
        result.push({ items: [ preresult.item ], result: preresult.result });
      } else {
        for (const nextresult of nextresults) result.push({ items: [ preresult.item, ...nextresult.items  ], result: nextresult.result });
      }
    } else {
      result.push({ items: [ preresult.item ], result: preresult.result });
    }
  }

  for (let subresult1 = 0; subresult1 < result.length; subresult1 += 1) {
    for (let subresult2 = 0; subresult2 < result.length; subresult2 += 1) {
      if (subresult1 === subresult2 || result[subresult1].items.length !== result[subresult2].items.length) continue;
      const subresult1sorted = result[subresult1].items.concat().sort((a,b) => a.name.localeCompare(b.name));
      const subresult2sorted = result[subresult2].items.concat().sort((a,b) => a.name.localeCompare(b.name));
      let same = true;
      for (const i in result[subresult1].items) {
        if (subresult1sorted[i] !== subresult2sorted[i]) {
          same = false;
          break;
        }
      }
      if (same) {
        result.splice(subresult2, 1);
        subresult1 = Math.max(0, subresult1 - 1);
        subresult2 = Math.max(0, subresult2 - 1);
      }
    }
  }

  result.sort((a, b) => a.result.ttk - b.result.ttk).splice(10);
  return result;
}