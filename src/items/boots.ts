import { Equip } from "../unit/equip";

const bootSymbol = Symbol("boots");

export const boot: Equip = { 
  unique: true,
  type: "item",
  name: "Boots",
  bonusMs: 25,
  uniqueGroup: bootSymbol,
};

export const boots: Equip[] = [
  boot,
];