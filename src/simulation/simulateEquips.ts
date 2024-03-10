import { Champion } from "../champions/champion/champion";
import { BestEquip, BestEquipConfig, simulateBestNextItem, simulateBestNextKeystone } from "./simulateEquip";

export class BestEquipsConfig<TChampion1 extends Champion> extends BestEquipConfig<TChampion1> {
  count = 1;
}

export const simulateBestNextItems = async <TChampion extends Champion>(config = new BestEquipsConfig<TChampion>()): Promise<BestEquip<TChampion>[]> => {
  for (const preresult of (await simulateBestNextItem(config)).slice(0, config.width)) {
    // needs recursion
    if (config.count > 1) {
      const oldChamp1 = config.champ1;
      config.champ1 = (sim) => {
        const champ = oldChamp1(sim);
        if (champ && champ.applyEquip(preresult.items[0])) return champ;
      }
      config.count -= 1;
      await simulateBestNextItems(config);
      config.count += 1;
      config.champ1 = oldChamp1;
    }
  }

  return config.sortResult();
}

export const simulateBestNextSetup = async <TChampion extends Champion>(config = new BestEquipsConfig<TChampion>()): Promise<BestEquip<TChampion>[]> => {
  if ((config.champ1(undefined) || undefined)?.keystone) throw new Error("simulateBestNextSetup works only without equiped keystone");
  
  const firstItem = (await simulateBestNextItem(config)).slice(0, config.width);
  config.result = [];  // reset result because it is without runes
  for (const ipreresult of firstItem) {
    const oldChamp1 = config.champ1;
    config.champ1 = (sim) => {
      const champ = oldChamp1(sim);
      if (champ && champ.applyEquip(ipreresult.items[0])) return champ;
    }
    const keystones = (await simulateBestNextKeystone(config)).slice(0, config.width);
    
    for (const kpreresult of keystones) {
      if (config.count > 1) {
        config.champ1 = (sim) => {
          const champ = oldChamp1(sim);
          if (champ && champ.applyEquip(ipreresult.items[0]) && champ.applyEquip(kpreresult.keystone)) return champ;
        }
        config.count -= 1;
        await simulateBestNextItems(config);
        config.count += 1;
      }
    }
    config.champ1 = oldChamp1;
  }
  
  return config.sortResult();
}