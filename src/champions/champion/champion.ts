import { Simulation } from "../../simulation/simulation";
import { Unit } from "../../unit/unit";

export abstract class Champion extends Unit {
  level = 1;

  baseHealth = 0;
  healthGrowth = 0;

  baseAd = 0;
  adGrowth = 0;

  baseArmor = 0;
  armorGrowth = 0;

  baseAs = 0;
  asGrowth = 0;

  calcStatGrowth(growth: number) {
    return growth * (this.level - 1) * (0.7025 + 0.0175 * (this.level - 1));
  }

  init(simIN?: Simulation): this {
    super.init(simIN);
    this.maxHealth = this.baseHealth + this.calcStatGrowth(this.healthGrowth);
    this.health = this.maxHealth;
    this.ad = this.baseAd + this.calcStatGrowth(this.adGrowth);
    this.armor = this.baseArmor + this.calcStatGrowth(this.armorGrowth);
    this.as = this.baseAs * (1 + this.calcStatGrowth(this.asGrowth));
    return this;
  }
}