import { Simulation } from "../../simulation/simulation";
import { Actions } from "../../unit/unit";
import { Champion } from "../champion/champion";
import { NunuStats } from "./NunuStats";

export class Nunu extends Champion {
  constructor() {
    super("Nunu");
  }

  stats = NunuStats;
  action: Actions;

  init(simIN?: Simulation): this {
    super.init(simIN);
    this.action = new Actions(this);
    this.action.init();
    return this;
  }
}