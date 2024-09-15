import { UnitAction } from "../../unit/unitAction";
import { Champion } from "../champion/champion";

export class MasterYiAction extends UnitAction {

}

export class MasterYi extends Champion {
  action: UnitAction = new MasterYiAction(this);

  baseHealth = 669;
  healthGrowth = 100;

  baseAd = 65;
  adGrowth = 2.2;

  baseArmor = 33;
  armorGrowth = 4.2;

  baseAs = 0.679;
  asGrowth = 0.02;
}