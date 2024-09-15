
export enum WheelItemRejection {
  SimulationStopped = 0,
}

export class WheelItem extends Promise<void> {
  constructor(internal = (i1: any, i2: any) => { return undefined; }, readonly time: number) {
    let resolve: (value: void) => void;
    let reject: (e: WheelItemRejection) => void;
    super((resolveIn, rejectIn) => { resolve = resolveIn; reject = rejectIn; return internal(resolve, reject); });
    this.resolve = resolve;
    this.reject = reject;
  }
  resolve: (value: void) => void;
  reject: (e: WheelItemRejection) => void;
}

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

  waitFor(time: number): Promise<void> {
    const wheelItem = new WheelItem(undefined, this.time + time);
    this.insertIntoWheel(wheelItem);
    return wheelItem;
  }

  private _isStopped = false;
  get isStopped() { return this._isStopped; }
  stop() { 
    this._isStopped = true;
    for (const wheelItem of this.wheel) {
      wheelItem.reject(WheelItemRejection.SimulationStopped);
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

export class Actor { // champion inside isolated

}

