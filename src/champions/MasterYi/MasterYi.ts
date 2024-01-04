import { Simulation } from "../../simulation/simulation";
import { TimedBuff } from "../../unit/buff";
import { Unit } from "../../unit/unit";
import { TimedSingletonAction, UnitAction } from "../../unit/unitAction";
import { DamageType } from "../../unit/unitInteraction";
import { Champion } from "../champion/champion";
import { MasterYiStats } from "./MasterYiStats";

export class MasterYiPassiveSkill {
  static readonly pname = "Double Strike";

  constructor(private readonly unit: Unit) { }

  init(): this {
    this.unit.action.attack.onHitUnit((target) => {
      const buff = this.buff;
      if (buff) {
        buff.stacks += 1;
        buff.remainingTime = 4000;
        if (buff.stacks >= 3) {
          buff.stacks = 0;
          target.interaction.takeDamage({ value: this.unit.ad * 0.5, src: this.unit, type: DamageType.PHYSIC });
          this.unit.action.attack.procOnHitUnit(target);
        }
      } else {
        new MasterYiPassiveBuff(this.unit);
      }
    });
    return this;
  }

  get buff() {
    return this.unit.buffsNamed(MasterYiPassiveSkill.pname)[0] as (MasterYiPassiveBuff | undefined);
  }
}

export class MasterYiPassiveBuff extends TimedBuff {
  stacks = 1;
  constructor(unit: Unit) {
    super(MasterYiPassiveSkill.pname, unit, 4000);
  }
  fade(): void {
    super.fade();
  }
}

export class MasterYiEBuff extends TimedBuff {
  private removeOnHit?: () => void;
  constructor(unit: Unit, readonly level: number) {
    level = Math.max(0, Math.min(5, level));
    super(MasterYiE.ename, unit, level ? 5000 : 0);
    if (!level) return;
    this.removeOnHit = unit.action.attack.onHitUnit((target) => {
      target.interaction.takeDamage({ value: 25+level*5, src: unit, type: DamageType.TRUE });
    });
  }
  fade(): void {
    super.fade();
    this.removeOnHit?.();
  }
}

export class MasterYiRBuff extends TimedBuff {
  private removeTakedown?: () => void;
  constructor(unit: Unit, readonly level: number) {
    level = Math.max(0, Math.min(3, level));
    super(MasterYiR.rname, unit, level ? 7000 : 0);
    if (!level) return;
    this.removeTakedown = unit.interaction.onTakedown((enemy, damagedTime) => {
      if (damagedTime + 10000 >= unit.sim.time) this.duration += 7000;
    });
    unit.bonusAs += 15 + level * 10;
  }
  fade(): void {
    super.fade();
    this.removeTakedown?.();
    this.unit.bonusAs -= 15 + this.level * 10;
  }
}

export class MasterYiE extends TimedSingletonAction {
  static readonly ename = "Wuju Style";
  protected maxLevel: number = 5;
  protected _isCancelableByUser: boolean = false;

  constructor(unit: Unit) {
    super(MasterYiE.ename, unit);
  }

  cast() {
    if (this.level === 0 || this.isCooldown) return;
    this.startCooldown(14000);
    new MasterYiEBuff(this.unit, this.level);
  }
}

export class MasterYiR extends TimedSingletonAction {
  static readonly rname = "Highlander";
  protected maxLevel: number = 3;
  protected _isCancelableByUser: boolean = false;

  constructor(unit: Unit) {
    super(MasterYiR.rname, unit);
  }

  cast() {
    if (this.level === 0 || this.isCooldown) return;
    this.startCooldown(85000);
    new MasterYiRBuff(this.unit, this.level);
  }
}

export class MasterYiW extends TimedSingletonAction {
  static readonly wname = "Meditate";
  protected maxLevel: number = 5;
  protected _isCancelableByUser: boolean = true;

  constructor(unit: Unit) {
    super(MasterYiW.wname, unit);
  }
  
  get dr() {
    if (this.level === 0) return 0;
    return 42.5 + this.level * 2.5;
  }

  get tickHeal() {
    if (this.level === 0) return 0;
    return (5 + this.level * 10) * (2 - this.unit.health / this.unit.maxHealth);
  }

  async cast() {
    if (this.level === 0 || this.unit.dead || (this.unit.action.current && this.unit.action.current !== this)) return;

    if (this.isCasting) {
      await this.waitForCast();
    } else {
      this.startCast(4000);
      this.startCooldown(9000);
      this.unit.action.attack.finishCooldown();
      const cancelDR = this.unit.interaction.percentDamageReduction((e) => {
        if (e.type === DamageType.TRUE) return;
        else if (time < 500) e.value *= 0.1;
        else e.value *= (100 - this.dr) / 100;
      });
      let time = 0;
      for (; time <= 4000; time += 500) {
        const result = await Promise.any([this.waitForCast(), this.unit.sim.waitFor(500), this.unit.onDeathPromise()]);
        if (result === true) {
          this.unit.interaction.takeHeal({ src: this.unit, value: this.tickHeal });
        } else {
          break;
        }
      }
      cancelDR();
    }
  }
}

export class MasterYiAction extends UnitAction {
  e: MasterYiE;
  r: MasterYiR;
  w: MasterYiW;
  passive: MasterYiPassiveSkill;

  init(): this {
    super.init();
    this.e = new MasterYiE(this.unit);
    this.r = new MasterYiR(this.unit);
    this.passive = new MasterYiPassiveSkill(this.unit).init();
    this.w = new MasterYiW(this.unit);
    return this;
  }
}

export class MasterYi extends Champion {
  action: MasterYiAction; 
  stats = MasterYiStats;

  init(simIN?: Simulation): this {
    super.init(simIN);
    this.action = new MasterYiAction(this);
    this.action.init();
    return this;
  }
}