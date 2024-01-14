import { Simulation } from "../../simulation/simulation";
import { TimedBuff } from "../../unit/buff";
import { Unit } from "../../unit/unit";
import { SelfAction, TargetAction, TimedSingletonAction, UnitAction } from "../../unit/unitAction";
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

export class MasterYiE extends SelfAction {
  static readonly ename = "Wuju Style";
  readonly maxLevel: number = 5;
  readonly minLevel: number = 1;
  readonly isCancelableByUser: boolean = false;
  readonly waitForCooldownInCast: boolean = false;
  readonly castCanceledWithCooldownReset: boolean = false;

  get castTime(): number {
    return 0;
  }
  get cooldownTime(): number {
    if (this.level === 0) return 0;
    return 14000;
  }

  constructor(unit: Unit) {
    super(MasterYiE.ename, unit);
  }

  protected onStartCast = undefined;
  protected onFinishCast = async () => {
    new MasterYiEBuff(this.unit, this.level);
  }
}

export class MasterYiR extends SelfAction {
  static readonly rname = "Highlander";
  readonly maxLevel: number = 3;
  readonly minLevel: number = 1;
  readonly isCancelableByUser: boolean = false;
  readonly waitForCooldownInCast: boolean = false;
  readonly castCanceledWithCooldownReset: boolean = false;
  
  get castTime(): number {
    return 0;
  }
  get cooldownTime(): number {
    if (this.level === 0) return 0;
    return 85000;
  }

  constructor(unit: Unit) {
    super(MasterYiR.rname, unit);
  }

  protected onStartCast = undefined;
  protected onFinishCast = async () => {
    new MasterYiRBuff(this.unit, this.level);
  }
}

export class MasterYiW extends SelfAction {
  static readonly wname = "Meditate";
  readonly maxLevel: number = 5;
  readonly minLevel: number = 1;
  readonly isCancelableByUser: boolean = true;
  readonly waitForCooldownInCast: boolean = false;
  readonly castCanceledWithCooldownReset: boolean = false;

  get castTime(): number {
    if (this.level === 0) return 0;
    return 4000;
  }
  get cooldownTime(): number {
    if (this.level === 0) return 0;
    return 9000;
  }

  get dr() {
    if (this.level === 0) return 0;
    return 42.5 + this.level * 2.5;
  }
  get tickHeal() {
    if (this.level === 0) return 0;
    return (5 + this.level * 10) * (2 - this.unit.health / this.unit.maxHealth);
  }

  constructor(unit: Unit) {
    super(MasterYiW.wname, unit);
  }

  protected readonly onStartCast = async () => {
    this.unit.action.attack.finishCooldown();
    const cancelDR = this.unit.interaction.percentDamageReduction((e) => {
      if (e.type === DamageType.TRUE) return;
      else if (time < 500) e.value *= 0.1;
      else e.value *= (100 - this.dr) / 100;
    });
    let time = 0;
    for (; time <= this.castTime; time += 500) {
      const result = await Promise.any([this.waitForCast(), this.unit.sim.waitFor(500), this.castInterruptPromise()]);
      if (result) {
        this.unit.interaction.takeHeal({ src: this.unit, value: this.tickHeal });
      } else {
        break;
      }
    }
    cancelDR();
  };

  protected onFinishCast?: () => Promise<void> = undefined;
}

export class MasterYiQ extends TargetAction {
  static readonly qname = "Alpha Strike";
  readonly maxLevel: number = 5;
  readonly minLevel: number = 1;
  readonly isCancelableByUser: boolean = false;
  readonly waitForCooldownInCast: boolean = false;
  readonly castCanceledWithCooldownReset: boolean = false;

  get castTime(): number {
    if (this.level === 0) return 0;
    return 231 * 4 + 165;
  }
  get cooldownTime(): number {
    if (this.level === 0) return 0;
    return 20500 - this.level * 500;
  }

  constructor(unit: Unit) {
    super(MasterYiQ.qname, unit);
  }

  protected onStartCast?: (target: Unit) => Promise<void> = async () => {
    this.unit.targetable = false;
    for (let time = 0; time < 231 * 4; time += 231) {
      await this.unit.sim.waitFor(231);
    }
    await this.unit.sim.waitFor(165);
    this.unit.targetable = true;
  }
  protected onFinishCast?: (target: Unit) => Promise<void> = undefined;
  
}

export class MasterYiAction extends UnitAction {
  e: MasterYiE;
  r: MasterYiR;
  w: MasterYiW;
  passive: MasterYiPassiveSkill;
  q: MasterYiQ;

  init(): this {
    super.init();
    this.e = new MasterYiE(this.unit);
    this.r = new MasterYiR(this.unit);
    this.passive = new MasterYiPassiveSkill(this.unit).init();
    this.w = new MasterYiW(this.unit);
    this.q = new MasterYiQ(this.unit);
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