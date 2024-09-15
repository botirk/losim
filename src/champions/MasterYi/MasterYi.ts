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
    })
  }
  fade(): void {
    super.fade();
    this?.removeOnHit();
  }
}

export class MasterYiE extends TimedSingletonAction {
  static readonly ename = "Wuju Style";

  constructor(unit: Unit) {
    super("Wuju Style", unit);
  }

  cast() {
    if (this.level === 0 || this.isCooldown) return;
    this.startCooldown(14);
    new MasterYiEBuff(this.unit, this.level);
  }
}

export class MasterYiAction extends UnitAction {
  e = new MasterYiE(this.unit);
}

export class MasterYi extends Champion {
  action: MasterYiAction = new MasterYiAction(this);

  baseHealth = 669;
  healthGrowth = 100;

  baseAd = 65;
  adGrowth = 2.2;

  baseArmor = 33;
  armorGrowth = 4.2;

  baseAs = 0.679;
  asGrowth = 0.02;
}