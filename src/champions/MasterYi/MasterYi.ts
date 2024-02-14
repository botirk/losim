import { Simulation } from "../../simulation/simulation";
import { Actions, Unit, UnitTeam } from "../../unit/unit";
import { Champion, spellShort } from "../champion/champion";
import { MasterYiStats } from "./MasterYiStats";
import { MasterYiE } from "./MasterYiE";
import { MasterYiR } from "./MasterYiR";
import { MasterYiW } from "./MasterYiW";
import { MasterYiQ } from "./MasterYiQ";
import { MasterYiPassive } from "./MasterYiPassive";

export class MasterYiAction extends Actions {
  passive: MasterYiPassive;
  q: MasterYiQ;
  w: MasterYiW;
  e: MasterYiE;
  r: MasterYiR;
  
  init(): this {
    super.init();
    this.e = new MasterYiE(this.owner);
    this.r = new MasterYiR(this.owner);
    this.passive = new MasterYiPassive(this.owner).init();
    this.w = new MasterYiW(this.owner);
    this.q = new MasterYiQ(this.owner);
    return this;
  }
}

export class MasterYi extends Champion {
  constructor() {
    super("Master Yi");
  }
  isMelee: boolean = true;
  
  action: MasterYiAction; 
  stats = MasterYiStats;

  levelUpPriority: [spellShort, spellShort, spellShort, spellShort] = ["R", "Q", "E", "W"];
  levelUp(): void {
    this.levelUpAnyChampion(this.action.q, this.action.w, this.action.e, this.action.r);
  }

  async killDummy(enemy: Unit) {
    if (this.distance(enemy) > this.action.attack.maxRange && await this.action.q.cast(enemy)) return;
    else if (await this.action.r.cast()) return;
    else if (this.action.attack.currentCast && await this.action.attack.currentCast.wait()) return;
    else if (this.action.attack.isCooldown && this.bonusAs.value < 125 && await this.action.q.cast(enemy)) return;
    else if (this.action.attack.castable(enemy) && await this.action.e.cast() && await this.action.attack.cast(enemy)) return;
    else if (!this.action.attack.currentCast && this.action.attack.isCooldown && this.action.attack.targetable(enemy) && this.action.w.castable()) {
      this.action.w.cast();
      if (this.currentCast.value?.action === this.action.w) await this.currentCast.value.cancel();
      await this.action.attack.cast(enemy);
    } else if (this.action.attack.isCooldown && await this.action.move.closeTo(enemy)) return; 
    else if (this.action.attack.castable(enemy) && await this.action.attack.cast(enemy)) return;
    else await this.action.move.closeTo(enemy);
  }

  init(simIN?: Simulation, team: UnitTeam = this.team, level = this.level): this {
    super.init(simIN, team, level);
    this.action = new MasterYiAction(this);
    this.action.init();
    return this;
  }
}