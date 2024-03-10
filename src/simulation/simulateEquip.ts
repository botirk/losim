import { Champion } from "../champions/champion/champion";
import { Simulation } from "./simulation";
import { SimulateDummyConfig, SimulateDummyResult, simulateDummy } from "./simulateDummy";
import { items } from "../items/index";
import { isBoot } from "../items/boots/index";
import { Equip, Item, Keystone, isItem } from "../unit/equip";
import { keystones } from "../runes/keystones/index";

export type BestEquip<TChampion1 extends Champion> = {
  items: Item[],
  keystone?: Keystone,
  result: SimulateDummyResult<TChampion1>,
}

export class BestEquipConfig<TChampion1 extends Champion> extends SimulateDummyConfig<TChampion1> {
  width = 10;
  itemsToLook: Item[] = items;
  keystonesToLook: Keystone[] = keystones;
  result: BestEquip<TChampion1>[] = [];
  sortResult() {
    if (this.sustain1) {
      return this.result.sort((a, b) => b.result.damage1 - a.result.damage1);
    } else {
      return this.result.sort((a, b) => a.result.ttk - b.result.ttk);
    }
  }
  addResult(result: SimulateDummyResult<TChampion1>) {
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

export const simulateBestNextItem = async <TChampion1 extends Champion>(config = new BestEquipConfig<TChampion1>()): Promise<BestEquip<TChampion1>[]> => {
  for (const item of config.itemsToLook) {
    const oldChamp1 = config.champ1;
    config.champ1 = (sim) => {
      const champ = oldChamp1(sim);
      if (champ && champ.applyEquip(item) && !config.championExists(champ)) return champ;
    }
    const subResult = await simulateDummy<TChampion1>(config);
    config.champ1 = oldChamp1;

    if (subResult) config.addResult(subResult);
  }

  return config.sortResult();
}

export const simulateBestNextKeystone = async <TChampion1 extends Champion>(config = new BestEquipConfig<TChampion1>()): Promise<BestEquip<TChampion1>[]> => {
  for (const keystone of config.keystonesToLook) {
    const oldChamp1 = config.champ1;
    config.champ1 = (sim) => {
      const champ = oldChamp1(sim);
      if (champ && champ.applyEquip(keystone) && !config.championExists(champ)) return champ;
    }
    const subResult = await simulateDummy<TChampion1>(config);
    config.champ1 = oldChamp1;

    if (subResult) config.addResult(subResult);
  }

  return config.sortResult();
}

export const simulateBestBoot = async <TChampion1 extends Champion>(config = new BestEquipConfig<TChampion1>()): Promise<BestEquip<TChampion1>[]> => {
  config.itemsToLook = config.itemsToLook.filter((item) => isBoot(item) && item.isFinished === true);
  return await simulateBestNextItem(config);
}
