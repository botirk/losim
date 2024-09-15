import { Unit } from "./unit"

export type EquipType = "item" | "rune";

export interface Equip {
  type: EquipType,
  name: string,

  bonusAs?: number,
  bonusAd?: number,
  crit?: number,
  /** from 0 to 100 */
  bonusCritDamage?: number,
  lifesteal?: number,

  armor?: number,
  mr?: number,
  
  maxHealth?: number,
  maxMana?: number,

  bonusMs?: number,
  /** 1 to 2, for example 30% movespeed is 1.3 */
  mMs?: number;

  abilityHaste?: number;

  apply?: (unit: Unit) => boolean | void,
}

export const isItem = (equip: Equip): equip is Item => {
  return equip.type === "item";
}

export interface Item extends Equip {
  type: "item",
  unique?: boolean,
  uniqueGroup?: symbol,
  isFinished: boolean,
}

export const isRune = (equip: Equip): equip is Rune => {
  return equip.type === "rune";
}

export type RuneSubtype = "Keystone";

export interface Rune extends Equip {
  type: "rune",
  subtype: RuneSubtype,
}

export type RunePath = "Precision" | "Domination" | "Sorcery" | "Resolve" | "Inspiration";

export interface Pathrune extends Rune {
  path: RunePath,
}

export const isKeystone = (equip: Equip): equip is Keystone => isRune(equip) && equip.subtype === "Keystone";

export interface Keystone extends Pathrune {
  subtype: "Keystone",
}