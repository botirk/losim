import { Equip } from "./equip";

const bootSymbol = Symbol("boots");

export const boots: Equip[] = [
  { 
    unique: true,
    type: "item",
    name: "Boots",
    bonusMs: 25,
    uniqueGroup: bootSymbol,
  },
]