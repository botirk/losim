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
    this.baseAd = this.stats.baseAd;
    this.bonusAd = this.calcStatGrowth(this.stats.adGrowth);
    this.attackRange = this.stats.attackRange;
    this.armor = this.stats.baseArmor + this.calcStatGrowth(this.stats.armorGrowth);
    this.attackAnimation = this.stats.attackAnimation;
    this.baseAs = this.stats.baseAs;
    this.bonusAs.value = this.calcStatGrowth(this.stats.asGrowth);
    this.baseMs = this.stats.baseMs;
    this.mana = this.stats.baseMana + this.calcStatGrowth(this.stats.manaGrowth);
    this.maxMana = this.mana;
    return this;
  }
}