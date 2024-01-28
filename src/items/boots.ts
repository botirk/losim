import { Equip } from "../unit/equip";

export const bootSymbol = Symbol("boots");

export const boot: Equip = { 
  unique: true,
  type: "item",
  name: "Boots",
  bonusMs: 25,
  uniqueGroup: bootSymbol,
};

export const berserkers: Equip = {
  unique: true,
  type: "finishedItem",
  name: "Berserker's Greaves",
  bonusMs: 45,
  bonusAs: 35,
  uniqueGroup: bootSymbol,
};

export const boots: Equip[] = [
  boot,
  berserkers,
];