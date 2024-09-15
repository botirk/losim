import { Champion } from "../champions/champion/champion";
import { Unit } from "../unit/unit";
import { WheelItem } from "./defered";
if (window) require("setimmediate");

export class Simulation { // optimized queue of actions
  tickTime = 33;

  private _time = 0;
  get time() { return this._time; }

  private wheel: WheelItem[] = [];
  private insertIntoWheel(wheelItem: WheelItem) {
    let start = 0, end = this.wheel.length - 1;
    while (start <= end) {
      const mid = (start + end) >> 1;
      if (this.wheel[mid].time > wheelItem.time) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }
    this.wheel.splice(start, 0, wheelItem);
  }
  reinsertIntoWheel(wheelItem: WheelItem, oldWaitFor: number) { 
    let start = 0, end = this.wheel.length - 1;
    while (start <= end) {
      const mid = (start + end) >> 1;
      if (this.wheel[mid] === wheelItem) {
        break;
      } else if (this.wheel[mid].time > oldWaitFor) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }
    if (this.wheel[start] === wheelItem) {
      this.wheel.splice(start, 1);
      this.insertIntoWheel(wheelItem);
    }
  }

  waitFor(time: number): WheelItem {
    const wheelItem = new WheelItem(undefined, this, time, (oldWaitFor) => this.reinsertIntoWheel(wheelItem, oldWaitFor));
    this.insertIntoWheel(wheelItem);
    return wheelItem;
  }
  waitForResolve() {
    return this.waitFor(0);
  }

  private _isStopped = false;
  get isStopped() { return this._isStopped; }
  stop() { 
    this._isStopped = true;
    for (const wheelItem of this.wheel) wheelItem.resolve(false);
  }

  private consume() {
    setImmediate(() => {
      const next = this.wheel.pop();
      this._time = next.time;
      next.resolve(true);
      if (!this.isStopped && this.wheel.length) this.consume();
    });
  }
  start(maxTime: number): this {
    this.waitFor(maxTime).then(() => { this.stop(); })
    this.consume();
    return this;
  }

  units: Unit[] = [];
}

export interface Simulate1v1Result<TChampion1 extends Champion, TChampion2 extends Champion> {
  ttk: number,
  dps1: number,
  dps2: number,
  distance: number,
  winner?: TChampion1 | TChampion2,
  champion1: TChampion1,
  champion2: TChampion2,
}

export const simulate1v1 = async <TChampion1 extends Champion, TChampion2 extends Champion>(
  getChampionsAndLogic: (sim: Simulation) => [TChampion1, (c1: TChampion1, c2: TChampion2) => Promise<void>, TChampion2, (c2: TChampion2, c1: TChampion1) => Promise<void>] | void, 
  maxTime = 180*1000
): Promise<Simulate1v1Result<TChampion1, TChampion2> | void> => {
  const sim = new Simulation();
  const get = getChampionsAndLogic(sim);
  if (!get) return;
  const [champ1, logic1, champ2, logic2] = get;

  sim.start(maxTime);
  // count damage
  let damage1 = 0, damage2 = 0;
  champ2.interaction.onTakeDamage((e) => damage1 += e.value);
  champ1.interaction.onTakeDamage((e) => damage2 += e.value);
  
  // logic
  const champ1Logic = async () => {
    while (!champ1.dead.value && !champ2.dead.value && !sim.isStopped) {
      const time = sim.time;
      await logic1(champ1, champ2);
      if (sim.time === time) await sim.waitFor(sim.tickTime * 2);
    }
  }
  const champ2Logic = async () => {
    while (!champ1.dead.value && !champ2.dead.value && !sim.isStopped) {
      const time = sim.time;
      await logic2(champ2, champ1);
      if (sim.time === time) await sim.waitFor(sim.tickTime * 2);
    }
  }

  // sim
  await Promise.all([ champ1Logic(), champ2Logic() ]);

  // winner
  const winner = (!champ1.dead.value && champ2.dead.value) ? champ1 : (champ1.dead.value && !champ2.dead.value) ? champ2 : undefined;

  // stats
  return {
    ttk: sim.time,
    dps1: damage1 / (sim.time / 1000),
    dps2: damage2 / (sim.time / 1000),
    distance: Math.abs(champ1.pos - champ2.pos),
    winner,
    champion1: champ1,
    champion2: champ2,
  };
}
