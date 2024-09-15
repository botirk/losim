import { StackBuff } from "../../unit/buff";
import { Equip } from "../../unit/equip";
import { Unit } from "../../unit/unit";
import { DamageType } from "../../unit/unitInteraction";

export class KrakenDebuff extends StackBuff {
  static kname() {
    return kraken.name + " debuff";
  }
  static duration = 6000;
  static maxStacks = 2;
  static damage(src: Unit, target: Unit) {
    let damage = 35;
    if (src.level >= 9) for (let level = 9; level <= 18; level += 1) damage += 5;
    // TODO add AP Scaling
    damage += src.ad * 0.65;

    const stacks = (target.buffNamed(KrakenDebuff.kname()) as KrakenDebuff | undefined)?.stacks || 0;
    damage *= (1 + stacks * 0.5);
    
    return damage;
  }

  constructor(owner: Unit, src: Unit) {
    super(KrakenDebuff.kname(), owner, KrakenDebuff.duration, true, src);
  }

  protected readonly maxStacks: number = KrakenDebuff.maxStacks;
}

export class KrakenBuff extends StackBuff {
  static duration = 3000;
  /** this is actually right so it procs every third attack */
  static maxStacks = 3;
    
  constructor(owner: Unit) {
    super(kraken.name, owner, KrakenBuff.duration, true);
  }

  protected readonly maxStacks: number = KrakenBuff.maxStacks;
}

export const kraken: Equip = {
  unique: true,
  type: "finishedItem",
  name: "Kraken Slayer",
  bonusAd: 40,
  bonusAs: 35,
  crit: 20,
  apply: (unit) => {
    unit.action.attack.onHitUnit((t) => {
      const buff = unit.buffNamed(kraken.name);
      if (buff instanceof KrakenBuff) {
        buff.stack();
      } else {
        new KrakenBuff(unit);
      }
    });
    unit.action.attack.onCast((t) => {
      const buff = unit.buffNamed(kraken.name);
      if (buff instanceof KrakenBuff) {
        if (!buff.isMaxStacks) return;
        t.interaction.takeDamage({ src: unit, type: DamageType.PHYSIC, value: KrakenDebuff.damage(unit, t) });
        const debuff = t.buffNamed(KrakenDebuff.kname());
        if (debuff instanceof KrakenDebuff) debuff.stack(); else new KrakenDebuff(t, unit);
        buff.fade();
      }
    });
  },
}