import { Simulation } from "../../simulation/simulation";
import { Actions } from "../../unit/unit";
import { Champion, spellShort } from "../champion/champion";
import { NunuStats } from "./NunuStats";

export class Nunu extends Champion {
  constructor() {
    super("Nunu");
  }
  isMelee: boolean = true;

  stats = NunuStats;
  action: Actions;

  levelUpPriority: [spellShort, spellShort, spellShort, spellShort] = ["R", "Q", "E", "W"];
  levelUp(): void {
    
  }

  init(simIN?: Simulation): this {
    super.init(simIN);
    this.action = new Actions(this);
    this.action.init();
    return this;
  }
}