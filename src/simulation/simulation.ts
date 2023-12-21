import { Rejection, WheelItem } from "../defered";

export class Simulation { // optimized queue of actions
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

  waitFor(time: number): WheelItem {
    const wheelItem = new WheelItem(undefined, this, time);
    this.insertIntoWheel(wheelItem);
    return wheelItem;
  }

  private _isStopped = false;
  get isStopped() { return this._isStopped; }
  stop() { 
    this._isStopped = true;
    for (const wheelItem of this.wheel) {
      wheelItem.reject(Rejection.SimulationStopped);
    }
  }

  private consume() {
    setImmediate(() => {
      const next = this.wheel.pop();
      this._time = next.time;
      next.resolve();
      if (!this.isStopped && this.wheel.length) this.consume();
    });
  }
  start(maxTime: number): this {
    this.waitFor(maxTime).then(() => { this.stop(); })
    this.consume();
    return this;
  }
}
