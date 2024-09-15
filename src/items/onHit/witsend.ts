import { Equip, Item } from "../../unit/equip";
import { Unit } from "../../unit/unit";
import { DamageType } from "../../unit/unitInteraction";


export const witsendDamage = (src: Unit) => {
  let damage = 15;
  if (src.level >= 9) for (let level = 9; level <= Math.min(14, src.level); level += 1) damage += 10;
  if (src.level >= 15) for (let level = 15; level <= Math.min(18, src.level); level += 1) damage += 1.25;
  return damage;
}

export const witsend: Item = {
  unique: true,
  type: "item",
  isFinished: true,
  name: "Wit's End",
  bonusAs: 55,
  mr: 50,
  // TODO: implement & add tenacity
  apply: (unit) => {
    unit.action.attack.onHitUnit((t, m) => {
      t.interaction.takeDamage({ src: unit, type: DamageType.MAGIC, value: witsendDamage(unit) * m });
    });
  },
}