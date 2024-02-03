import { MasterYi } from "../champions/MasterYi/MasterYi";
import { Simulation } from "../simulation/simulation";
import { TimedBuff, TimedSlow } from "../unit/buff";
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

export class GuinsoBuff extends TimedBuff {
  static duration = 3000;
  static phantomDuration = 3000;
  static maxStacks = 4;
  static bonusAsPerStack = 8;

  constructor(owner: Unit) {
    super(guinso.name, owner, GuinsoBuff.duration, true);
    this.stacks = 1;
  }

  private _stacks = 0;
  set stacks(stacks: number) {
    this._stacks = Math.max(0, Math.min(GuinsoBuff.maxStacks, stacks));
    this.currentAs = GuinsoBuff.bonusAsPerStack * this._stacks;
  }
  get stacks() {
    return this._stacks;
  }

  private _currentAs = 0;
  private set currentAs(currentAs: number) {
    if (this._currentAs === currentAs) return;
    this.owner.bonusAs.value += (-this._currentAs + currentAs);
    this._currentAs = currentAs;
  }
  get currentAs() {
    return this._currentAs;
  }

  onAttack(target: Unit) {
    if (this.stacks >= GuinsoBuff.maxStacks) {
      const phantom = this.owner.buffNamed(GuinsoPhantomBuff.pname) as GuinsoPhantomBuff;
      if (phantom) phantom.onAttack(target);
      else new GuinsoPhantomBuff(this.owner);
    } else {
      this.stacks += 1;
    }
    this.remainingTime = GuinsoBuff.duration;
  }

  fade(): void {
    if (!this.isActive) return;
    this.stacks = 0;
    super.fade();
  }
}

export class GuinsoPhantomBuff extends TimedBuff {
  static pname = GuinsoBuff.name + "Phantom";
  static duration = 6000;
  static pause = 150;
  constructor(owner: Unit) {
    super(GuinsoPhantomBuff.pname, owner, GuinsoPhantomBuff.duration, true);
  }

  onAttack(target: Unit) {
    this.owner.sim.waitFor(GuinsoPhantomBuff.pause).then(() => {
      if (target.targetable.value) this.owner.action.attack.procOnHitUnit(target, 1);
    });
    this.fade();
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
      const buff = unit.buffNamed(guinso.name) as GuinsoBuff;
      if (buff) {
        buff.onAttack(t);
      } else {
        new GuinsoBuff(unit);
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

      await sim.waitFor(150 + 1);
      expect(count).toBe(7);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(count).toBe(8);

      expect(await yi1.action.attack.cast(yi2)).toBe(true);
      expect(count).toBe(9);

      await sim.waitFor(150 + 1);
      expect(count).toBe(10);

      await sim.waitFor(GuinsoPhantomBuff.duration + 1);
      expect(yi1.buffNamed(GuinsoPhantomBuff.pname)).toBeUndefined();

      await sim.waitFor(GuinsoBuff.duration - GuinsoPhantomBuff.duration);
      expect(yi1.bonusAs.value).toBe(25);
      expect(yi1.buffNamed(guinso.name)).toBeUndefined();
      
    });
  }
}

export const onHitItems: Equip[] = [
  botrk,
  witsend,
  guinso,
]