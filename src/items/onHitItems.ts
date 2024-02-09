import { MasterYi } from "../champions/MasterYi/MasterYi";
import { Simulation } from "../simulation/simulation";
import { StackBuff, TimedBuff, TimedSlow } from "../unit/buff";
import { Equip } from "../unit/equip";
import { Unit } from "../unit/unit";
import { DamageType } from "../unit/unitInteraction";

export const botrkDamage = (src: Unit, target: Unit) => {
  return (src.isMelee ? 0.12 * target.health : 0.09 * target.health);
}

export const botrk: Equip = {
  unique: true,
  type: "finishedItem",
  name: "Blade of the Ruined King",
  bonusAd: 40,
  bonusAs: 25,
  lifesteal: 8,
  apply: (unit) => {
    let lastActivation = -Infinity;
    unit.action.attack.onHitUnit((t, m) => {
      const result = t.interaction.takeDamage({ src: unit, type: DamageType.PHYSIC, value: botrkDamage(unit, t) * m }).value;
      if (unit.lifesteal > 0) unit.interaction.takeHeal({ value: result * (unit.lifesteal / 100), src: unit });
      if (lastActivation + 15000 <= unit.sim.time) {
        lastActivation = unit.sim.time;
        new TimedSlow(botrk.name, t, 1000, unit, 30);
      }
    });
  },
  test: () => {
    test("botrk", async () => {
      const sim = new Simulation().start(500000);
      const yi1 = new MasterYi().init(sim);
      const yi2 = new MasterYi().init(sim);
      yi2.armor = 0;
      yi2.health = 1000;
      expect(yi1.applyEquip(botrk)).toBe(true);

      let botrkhits = 0;
      yi2.interaction.onTakeDamage((e) => {
        if (e.src === yi1 && e.type === DamageType.PHYSIC && e.value === 120) botrkhits += 1;
      });

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(botrkhits).toBe(1);

      expect(yi2.slow).toBe(30);
      expect(yi2.ms).toBeLessThan(300);

      await sim.waitFor(1001);
      expect(yi2.slow).toBe(0);
      expect(yi2.ms).toBeGreaterThan(300);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(yi2.slow).toBe(0);
      expect(yi2.ms).toBeGreaterThan(300);

      await sim.waitFor(15000 - 1001 - yi1.action.attack.castTime * 2);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(yi2.slow).toBe(30);
      expect(yi2.ms).toBeLessThan(300);
    });
  },
}

export const witsendDamage = (src: Unit) => {
  let damage = 15;
  if (src.level >= 9) for (let level = 9; level <= Math.min(14, src.level); level += 1) damage += 10;
  if (src.level >= 15) for (let level = 15; level <= Math.min(18, src.level); level += 1) damage += 1.25;
  return damage;
}

export const witsend: Equip = {
  unique: true,
  type: "finishedItem",
  name: "Wit's End",
  bonusAs: 55,
  mr: 50,
  // TODO: implement & add tenacity
  apply: (unit) => {
    unit.action.attack.onHitUnit((t, m) => {
      t.interaction.takeDamage({ src: unit, type: DamageType.MAGIC, value: witsendDamage(unit) * m });
    });
  },
  test: () => {
    test("Witsend", async () => {
      const sim = new Simulation().start(500000);
      const yi1 = new MasterYi().init(sim);
      expect(yi1.applyEquip(witsend)).toBe(true);
      const yi2 = new MasterYi().init(sim);
      expect(witsendDamage(yi1)).toBe(15);

      yi1.level = 6;
      expect(witsendDamage(yi1)).toBe(15);

      yi1.level = 12;
      expect(witsendDamage(yi1)).toBe(55);

      yi1.level = 17;
      expect(witsendDamage(yi1)).toBe(78.75);

      let magic = 0;
      yi2.interaction.onTakeDamage((e) => {
        if (e.src === yi1 && e.type === DamageType.MAGIC && e.value >= 50) magic += 1;
      });
      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(magic).toBe(1);
    });
  }
}

export class GuinsoBuff extends StackBuff {
  static duration = 3000;
  static phantomDuration = 3000;
  static maxStacks = 4;
  static bonusAsPerStack = 8;

  protected readonly maxStacks: number = GuinsoBuff.maxStacks;

  constructor(owner: Unit) {
    super(guinso.name, owner, GuinsoBuff.duration, true);
  }

  protected onLoseStats(): void {
    this.owner.bonusAs.value -= this.stacks * GuinsoBuff.bonusAsPerStack;
  }
  protected onGainStats(): void {
    this.owner.bonusAs.value += this.stacks * GuinsoBuff.bonusAsPerStack;
  }
}

export class GuinsoPhantomBuff extends StackBuff {
  static pname = GuinsoBuff.name + "Phantom";
  static duration = 6000;
  static pause = 150;

  protected readonly maxStacks: number = 2;

  constructor(owner: Unit) {
    super(GuinsoPhantomBuff.pname, owner, GuinsoPhantomBuff.duration, true);
  }
}

export const guinso: Equip = {
  name: "Guinsoo's Rageblade",
  unique: true,
  type: "finishedItem",
  bonusAd: 30,
  bonusAs: 25,
  // TODO: AP
  apply: (unit) => {
    unit.action.attack.onHitUnit((t, m) => t.interaction.takeDamage({ src: unit, type: DamageType.MAGIC, value: 30 * m }));
    unit.action.attack.onCast((t) => {
      const buff = unit.buffNamed(guinso.name);
      if (!(buff instanceof GuinsoBuff)) {
        new GuinsoBuff(unit);
      } else {
        if (buff.isMaxStacks) {
          const pbuff = unit.buffNamed(GuinsoPhantomBuff.pname);
          if (!(pbuff instanceof GuinsoPhantomBuff)) {
            new GuinsoPhantomBuff(unit);
          } else {
            if (pbuff.isMaxStacks) {
              unit.sim.waitFor(GuinsoPhantomBuff.pause).then(() => {
                if (!unit.dead.value && t.targetable.value) unit.action.attack.procOnHitUnit(t, 1);
              });
              pbuff.fade();
            } else {
              pbuff.stack();
            }
          }
        }
        buff.stack();
      }
    });
  },
  test: () => {
    test("guinso basic", async () => {
      const sim = new Simulation().start(500000);
      const yi1 = new MasterYi().init(sim);
      expect(yi1.applyEquip(guinso)).toBe(true);
      const yi2 = new MasterYi().init(sim);
      yi2.mr = 0;

      let magic = 0;
      yi2.interaction.onTakeDamage((e) => {
        if (e.src === yi1 && e.type === DamageType.MAGIC && e.value == 30) magic += 1;
      });
      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(magic).toBe(1);
    });

    test("guinso", async () => {
      const sim = new Simulation().start(500000);
      const yi1 = new MasterYi().init(sim);
      yi1.action.passive.disabled = true;
      expect(yi1.applyEquip(guinso)).toBe(true);
      const yi2 = new MasterYi().init(sim);
      yi2.health = 10000;
      
      let count = 0;
      yi1.action.attack.onHitUnit(() => count += 1);

      expect(yi1.bonusAs.value).toBe(25);
      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(count).toBe(1);
      expect(yi1.bonusAs.value).toBe(25 + 8);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(count).toBe(2);
      expect(yi1.bonusAs.value).toBe(25 + 8 * 2);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(count).toBe(3);
      expect(yi1.bonusAs.value).toBe(25 + 8 * 3);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(count).toBe(4);
      expect(yi1.bonusAs.value).toBe(25 + 8 * 4);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(count).toBe(5);
      expect(yi1.bonusAs.value).toBe(25 + 8 * 4);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(count).toBe(6);
      expect(yi1.bonusAs.value).toBe(25 + 8 * 4);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(count).toBe(7);
      expect(yi1.bonusAs.value).toBe(25 + 8 * 4);

      await sim.waitFor(150 + 1);
      expect(count).toBe(8);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(count).toBe(9);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(count).toBe(10);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(count).toBe(11);

      await sim.waitFor(150 + 1);
      expect(count).toBe(12);

      await sim.waitFor(GuinsoPhantomBuff.duration + 1);
      expect(yi1.buffNamed(GuinsoPhantomBuff.pname)).toBeUndefined();

      await sim.waitFor(GuinsoBuff.duration - GuinsoPhantomBuff.duration);
      expect(yi1.bonusAs.value).toBe(25);
      expect(yi1.buffNamed(guinso.name)).toBeUndefined();
      
    });
  }
}

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
  test: () => {
    test("kraken basic", async () => {
      const sim = new Simulation().start(500000);
      const yi1 = new MasterYi().init(sim);
      yi1.action.passive.disabled = true;
      expect(yi1.applyEquip(kraken)).toBe(true);
      const yi2 = new MasterYi().init(sim);
      yi2.armor = 0;
      yi2.health = 10000;

      let count = 0;
      yi2.interaction.onTakeDamage((e) => {
        if (e.type === DamageType.PHYSIC && e.value > 0) count += 1;
      });

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(count).toBe(2);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(count).toBe(4);
    });

    test("kraken advanced", async () => {
      const sim = new Simulation().start(500000);
      const yi1 = new MasterYi().init(sim);
      yi1.action.passive.disabled = true;
      expect(yi1.applyEquip(kraken)).toBe(true);
      yi1.crit = 0;
      const yi2 = new MasterYi().init(sim);
      yi2.armor = 0;
      yi2.health = 10000;

      const damage = {};
      yi2.interaction.onTakeDamage((e) => {
        if (e.type === DamageType.PHYSIC && e.value > 0) damage[e.value.toFixed(2)] = true;
      });

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(Object.values(damage).length).toBe(1);
      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(Object.values(damage).length).toBe(2);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(Object.values(damage).length).toBe(2);
      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(Object.values(damage).length).toBe(2);
      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(Object.values(damage).length).toBe(3);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(Object.values(damage).length).toBe(3);
      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(Object.values(damage).length).toBe(4);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(Object.values(damage).length).toBe(4);
      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(Object.values(damage).length).toBe(4);
    });
  }
}

export const onHitItems: Equip[] = [
  botrk,
  witsend,
  guinso,
  kraken,
]