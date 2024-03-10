import { Simulation } from "../../simulation/simulation";
import { Action, AnyAction } from "../../unit/action/action";
import { Unit, UnitTeam } from "../../unit/unit";
import { ChampionStats } from "./championStats";

export type spellShort = "Q" | "W" | "E" | "R";

export abstract class Champion extends Unit {
  abstract stats: ChampionStats;

  abstract levelUpPriority: [spellShort, spellShort, spellShort, spellShort];
  levelUpAnyChampion(Q: AnyAction, W: AnyAction, E: AnyAction, R: AnyAction) {
    for (let availableLevelUps = this.level; availableLevelUps > 0; availableLevelUps -= 1) {
        let first: AnyAction;
        switch(this.levelUpPriority[0]) {
          case "Q":
            first = Q;
            break;
          case "W":
            first = W;
            break;
          case "E":
            first = E;
            break;
          default:
          case "R":
            first = R;
            break;
        }
        let second: AnyAction;
        switch(this.levelUpPriority[1]) {
          case "Q":
            second = Q;
            break;
          case "W":
            second = W;
            break;
          case "E":
            second = E;
            break;
          default:
          case "R":
            second = R;
            break;
        }
        let third: AnyAction;
        switch(this.levelUpPriority[2]) {
          case "Q":
            third = Q;
            break;
          case "W":
            third = W;
            break;
          case "E":
            third = E;
            break;
          default:
          case "R":
            third = R;
            break;
        }
        let fourth: AnyAction;
        switch(this.levelUpPriority[3]) {
          case "Q":
            fourth = Q;
            break;
          case "W":
            fourth = W;
            break;
          case "E":
            fourth = E;
            break;
          default:
          case "R":
            fourth = R;
            break;
        }
        if (first.level >= first.minLevel) {
          if (second.minLevel < second.minLevel && second.levelUp()) continue;
          if (second.level >= second.minLevel) {
            if (third.minLevel < third.minLevel && third.levelUp()) continue;
            if (third.level >= third.minLevel) {
              if (fourth.level < fourth.minLevel && fourth.levelUp()) continue;
            }
          }
        }

        if (!first.levelUp()) if (!second.levelUp()) if (!third.levelUp()) if (!fourth.levelUp()) {}
    }
  }
  abstract levelUp(): void;

  calcStatGrowth(growth: number) {
    return growth * (this.level - 1) * (0.7025 + 0.0175 * (this.level - 1));
  }

  init(simIN?: Simulation, team: UnitTeam = this.team, level = this.level): this {
    super.init(simIN, team, level);
    this.health = this.maxHealth = this.baseMaxHealth = this.stats.baseHealth + this.calcStatGrowth(this.stats.healthGrowth);
    this.baseAd = this.stats.baseAd;
    this.bonusAd = this.calcStatGrowth(this.stats.adGrowth);
    this.attackRange = this.stats.attackRange;
    this.bonusArmor = this.stats.baseArmor + this.calcStatGrowth(this.stats.armorGrowth);
    this.attackAnimation = this.stats.attackAnimation;
    this.baseAs = this.stats.baseAs;
    this.bonusAs.value = this.calcStatGrowth(this.stats.asGrowth);
    this.baseMs = this.stats.baseMs;
    this.mana = this.maxMana = this.stats.baseMana + this.calcStatGrowth(this.stats.manaGrowth);
    return this;
  }
}