import { Rejection, WheelItem } from "./defered";

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
}
