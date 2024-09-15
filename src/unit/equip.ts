import { Unit } from "./unit"

export type EquipType = "item" | "finishedItem";

export interface Equip {
  type: EquipType,
  name: string,
  unique?: boolean,
  uniqueGroup?: symbol,

  bonusAs?: number,
  bonusAd?: number,
  crit?: number,
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