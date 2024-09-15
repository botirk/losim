import { Simulation } from "../../simulation/simulation";
import { Actions } from "../../unit/unit";
import { Champion } from "../champion/champion";
import { MasterYiStats } from "./MasterYiStats";
import { MasterYiE } from "./MasterYiE";
import { MasterYiR } from "./MasterYiR";
import { MasterYiW } from "./MasterYiW";
import { MasterYiQ } from "./MasterYiQ";
import { MasterYiPassive } from "./MasterYiPassive";

export class MasterYiAction extends Actions {
  e: MasterYiE;
  r: MasterYiR;
  w: MasterYiW;
  passive: MasterYiPassive;
  q: MasterYiQ;

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

  action: MasterYiAction; 
  stats = MasterYiStats;

  init(simIN?: Simulation): this {
    super.init(simIN);
    this.action = new MasterYiAction(this);
    this.action.init();
    return this;
  }
}