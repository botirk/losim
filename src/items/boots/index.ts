import { Equip, Item } from "../../unit/equip";

export const bootSymbol = Symbol("boots");

export const isBoot = (equip: Item): boolean => equip.uniqueGroup === bootSymbol;

export const boot: Item = {
  unique: true,
  type: "item",
  isFinished: false,
  name: "Boots",
  bonusMs: 25,
  uniqueGroup: bootSymbol,
};

export const berserkers: Item = {
  unique: true,
  type: "item",
  isFinished: true,
  name: "Berserker's Greaves",
  bonusMs: 45,
  bonusAs: 35,
  uniqueGroup: bootSymbol,
};

export const boots = [
  boot,
  berserkers,
];