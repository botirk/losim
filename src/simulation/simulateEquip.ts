import { Champion } from "../champions/champion/champion";
import { Simulation } from "./simulation";
import { SimulateDummyConfig, SimulateDummyResult, simulateDummy } from "./simulateDummy";
import { items } from "../items/index";
import { isBoot } from "../items/boots/index";
import { Equip, Item, isItem } from "../unit/equip";

export type BestEquip<TChampion extends Champion> = {
  items: Item[],
  result: SimulateDummyResult<TChampion>,
}

export class BestNextItemConfig<TChampion extends Champion> extends SimulateDummyConfig {
  width = 10;
  itemsToLook: Item[] = items;
  result: BestEquip<TChampion>[] = [];
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

    if (subResult) {
      config.addChampion(subResult.champion1);

      config.result.push({
        items: subResult.champion1.appliedEquips.filter(e => isItem(e)) as Item[],
        result: subResult,
      });

      if (config.sustain1) {
        config.result.sort((a, b) => b.result.damage1 - a.result.damage1);
      } else {
        config.result.sort((a, b) => a.result.ttk - b.result.ttk);
      }
    }
  }

  return config.result;
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

  if (config.sustain1) {
    config.result.sort((a, b) => b.result.damage1 - a.result.damage1);
  } else {
    config.result.sort((a, b) => a.result.ttk - b.result.ttk);
  }
  return config.result;
}