import { Simulation } from "../../simulation/simulation";
import { Unit } from "../../unit/unit";

export abstract class Champion extends Unit {
  level = 1;

  protected baseHealth = 0;
  protected healthGrowth = 0;

  protected baseAd = 0;
  protected adGrowth = 0;

  protected baseArmor = 0;
  protected armorGrowth = 0;

  protected asGrowth = 0;

  calcStatGrowth(growth: number) {
    return growth * (this.level - 1) * (0.7025 + 0.0175 * (this.level - 1));
  }

  init(simIN?: Simulation): this {
    super.init(simIN);
    this.maxHealth = this.baseHealth + this.calcStatGrowth(this.healthGrowth);
    this.health = this.maxHealth;
    this.ad = this.baseAd + this.calcStatGrowth(this.adGrowth);
    this.armor = this.baseArmor + this.calcStatGrowth(this.armorGrowth);
    this.bonusAs = this.calcStatGrowth(this.asGrowth);
    return this;
  }
}