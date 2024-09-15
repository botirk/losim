import { Champion } from "../champions/champion/champion";
import { Simulation } from "./simulation";
import { SimulateDummyConfig, SimulateDummyResult, simulateDummy } from "./simulateDummy";
import { items } from "../items/index";
import { isBoot } from "../items/boots/index";
import { Equip, Item, Keystone, isItem } from "../unit/equip";
import { keystones } from "../runes/keystones/index";

export type BestEquip<TChampion extends Champion> = {
  items: Item[],
  keystone?: Keystone,
  result: SimulateDummyResult<TChampion>,
}

export class BestNextItemConfig<TChampion extends Champion> extends SimulateDummyConfig {
  width = 10;
  itemsToLook: Item[] = items;
  keystonesToLook: Keystone[] = keystones;
  result: BestEquip<TChampion>[] = [];
  sortResult() {
    if (this.sustain1) {
      return this.result.sort((a, b) => b.result.damage1 - a.result.damage1);
    } else {
      return this.result.sort((a, b) => a.result.ttk - b.result.ttk);
    }
  }
  addResult(result: SimulateDummyResult<TChampion>) {
    this.addChampion(result.champion1);
    this.result.push({
      items: result.champion1.appliedEquips.filter(e => isItem(e)) as Item[],
      keystone: result.champion1.keystone || undefined,
      result: result,
    });
  }

  private simulatedItems: { [key: string]: boolean } = {};
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

export const simulateBestNextItem = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion | void, config = new BestNextItemConfig<TChampion>()): Promise<BestEquip<TChampion>[]> => {
  for (const item of config.itemsToLook) {
    const subResult = await simulateDummy<TChampion>((sim) => {
      const champ = getChampion(sim);
      if (champ && champ.applyEquip(item) && !config.championExists(champ)) return champ;
    }, config);

    if (subResult) config.addResult(subResult);
  }

  return config.sortResult();
}

export const simulateBestNextKeystone = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion | void, config = new BestNextItemConfig<TChampion>()): Promise<BestEquip<TChampion>[]> => {
  for (const keystone of config.keystonesToLook) {
    const subResult = await simulateDummy<TChampion>((sim) => {
      const champ = getChampion(sim);
      if (champ && champ.applyEquip(keystone) && !config.championExists(champ)) return champ;
    }, config);

    if (subResult) config.addResult(subResult);
  }

  return config.sortResult();
}

export const simulateBestBoot = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion | void, config = new BestNextItemConfig<TChampion>()): Promise<BestEquip<TChampion>[]> => {
  config.itemsToLook = config.itemsToLook.filter((item) => isBoot(item) && item.isFinished === true);
  return await simulateBestNextItem(getChampion, config);
}

export const simulateBestNextItems = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion | void, count: number, config = new BestNextItemConfig<TChampion>()): Promise<BestEquip<TChampion>[]> => {
  for (const preresult of (await simulateBestNextItem(getChampion, config)).slice(0, config.width)) {
    // needs recursion
    if (count > 1) {
      await simulateBestNextItems((sim) => {
        const champ = getChampion(sim);
        if (champ && champ.applyEquip(preresult.items[0])) return champ;
      }, count - 1, config);
    }
  }

  return config.sortResult();
}

export const simulateBestNextSetup = async <TChampion extends Champion>(getChampion: (sim: Simulation) => TChampion | void, count: number, config = new BestNextItemConfig<TChampion>()): Promise<BestEquip<TChampion>[]> => {
  if ((getChampion(undefined) || undefined)?.keystone) throw new Error("simulateBestNextSetup works only without equiped keystone");
  
  const firstItem = (await simulateBestNextItem(getChampion, config)).slice(0, config.width);
  config.result = [];  // reset result because it is without runes
  for (const ipreresult of firstItem) {
    const keystones = (await simulateBestNextKeystone(sim => {
      const champ = getChampion(sim);
      if (champ && champ.applyEquip(ipreresult.items[0])) return champ;
    }, config)).slice(0, config.width);

    for (const kpreresult of keystones) {
      if (count > 1) {
        await simulateBestNextItems((sim) => {
          const champ = getChampion(sim);
          if (champ && champ.applyEquip(ipreresult.items[0]) && champ.applyEquip(kpreresult.keystone)) return champ;
        }, count - 1, config);
      }
    }
  }
  
  return config.sortResult();
}