import { Simulation } from "../../simulation/simulation";
import { Unit } from "../../unit/unit";
import { ChampionStats } from "./championStats";

export abstract class Champion extends Unit {
  level = 1;
  abstract stats: ChampionStats;

  calcStatGrowth(growth: number) {
    return growth * (this.level - 1) * (0.7025 + 0.0175 * (this.level - 1));
  }

  init(simIN?: Simulation): this {
    super.init(simIN);
    this.maxHealth = this.stats.baseHealth + this.calcStatGrowth(this.stats.healthGrowth);
    this.health = this.maxHealth;
    this.ad = this.stats.baseAd + this.calcStatGrowth(this.stats.adGrowth);
    this.armor = this.stats.baseArmor + this.calcStatGrowth(this.stats.armorGrowth);
    this.baseAs = this.stats.baseAs;
    this.bonusAs = this.calcStatGrowth(this.stats.asGrowth);
    return this;
  }
}