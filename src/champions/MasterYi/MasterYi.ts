import { Buff, TimedBuff } from "../../unit/buff";
import { Unit } from "../../unit/unit";
import { TimedSingletonAction, UnitAction } from "../../unit/unitAction";
import { Champion } from "../champion/champion";

export class MasterYiEBuff extends TimedBuff {
  private removeOnHit?: () => void;
  constructor(unit: Unit, readonly level: number) {
    level = Math.max(0, Math.min(5, level));
    super(MasterYiE.ename, unit, level ? 5000 : 0);
    if (!level) return;
    this.removeOnHit = unit.action.attack.onHitUnit((target) => {
      target.interaction.takeDamage(25+level*5, unit);
    });
  }
  fade(): void {
    super.fade();
    this?.removeOnHit();
  }
}

export class MasterYiRBuff extends TimedBuff {
  constructor(unit: Unit, readonly level: number) {
    level = Math.max(0, Math.min(3, level));
    super(MasterYiR.rname, unit, level ? 7000 : 0);
    if (!level) return;
    unit.bonusAs += 15 + level * 10;
  }
  fade(): void {
    super.fade();
    this.unit.bonusAs -= 15 + this.level * 10;
  }
}

export class MasterYiE extends TimedSingletonAction {
  static readonly ename = "Wuju Style";

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

  constructor(unit: Unit) {
    super(MasterYiR.rname, unit);
  }

  cast() {
    if (this.level === 0 || this.isCooldown) return;
    this.startCooldown(85000);
    new MasterYiRBuff(this.unit, this.level);
  }
}

export class MasterYiAction extends UnitAction {
  e = new MasterYiE(this.unit);
  r = new MasterYiR(this.unit);
}

export class MasterYi extends Champion {
  action: MasterYiAction = new MasterYiAction(this);

  protected baseHealth = 669;
  protected healthGrowth = 100;

  protected baseAd = 65;
  protected adGrowth = 2.2;

  protected baseArmor = 33;
  protected armorGrowth = 4.2;

  baseAs = 0.679;
  protected asGrowth = 2;
}