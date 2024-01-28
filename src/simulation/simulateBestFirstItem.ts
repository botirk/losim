import { Champion } from "../champions/champion/champion";
import { Simulation } from "./simulation";
import { SimulateDummyResult, simulateDummy } from "./simulateDummy";
import { items } from "../items/items"
import { bootSymbol, boots } from "../items/boots";
import { Equip } from "../unit/equip";

interface FirstItemSetupResult<TChampion extends Champion> {
  item: Equip,
  result: SimulateDummyResult<TChampion>,
}

export const simulateBestFirstItemSetup = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion, dummyRunsAway = false, itemsToLook = items): Promise<FirstItemSetupResult<TChampion>[]> => {
  const results: FirstItemSetupResult<TChampion>[] = [];
  
  const fitems = itemsToLook.filter((item) => item.uniqueGroup !== bootSymbol && item.type === "finishedItem");
  for (const item of fitems) {
    const result = await simulateDummy<TChampion>((sim) => {
      const champ = getChampion(sim);
      if (champ.applyEquip(item)) return champ;
    }, dummyRunsAway);
    if (result) {
      results.push({ item, result });
      results.sort((a, b) => a.result.ttk - b.result.ttk);
      results.splice(10);
    }
  }

  return results;
}

interface FirstItemSetupWithBootsResult<TChampion extends Champion> extends FirstItemSetupResult<TChampion> {
  boot: Equip,
}

export const simulateBestFirstItemSetupWithBoots = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion, dummyRunsAway = false, itemsToLook = items): Promise<FirstItemSetupWithBootsResult<TChampion>[]> => {
  const results: FirstItemSetupWithBootsResult<TChampion>[] = [];
  
  for (const preresult of await simulateBestFirstItemSetup(getChampion, dummyRunsAway, itemsToLook)) {
    let bestBootResult = undefined as FirstItemSetupWithBootsResult<TChampion> | undefined;
    for (const boot of itemsToLook.filter((item) => item.uniqueGroup === bootSymbol && item.type === "finishedItem")) {
      const tempresult = await simulateDummy<TChampion>((sim) => {
        const champ = getChampion(sim);
        if (champ.applyEquip(preresult.item) && champ.applyEquip(boot)) return champ;
      }, dummyRunsAway);
      if (tempresult && (bestBootResult === undefined || bestBootResult.result.ttk < tempresult.ttk)) bestBootResult = { boot, item: preresult.item, result: tempresult };
    }
    if (bestBootResult) results.push(bestBootResult);
  }

  return results.sort((a, b) => a.result.ttk - b.result.ttk);
}