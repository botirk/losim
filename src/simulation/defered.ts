import { Simulation } from "./simulation";

export enum Rejection {
  SimulationStopped = 0,
  UnitDeath = 1,
  RemoveEventListener = 2,
  Canceled = 3,
  TargetDeath = 4,
}

export class Defered<TResolve = void> extends Promise<TResolve> {
  constructor(internal = (i1: any, i2: any) => { return undefined; }) {
    let resolve: (value: TResolve) => void;
    let reject: (e: Rejection) => void;
    super((resolveIn, rejectIn) => { resolve = resolveIn; reject = rejectIn; return internal(resolveIn, rejectIn); });
    this._resolve = resolve;
    this._reject = reject;
  }

  private _isProcced = false;
  get isProcced() {
    return this._isProcced;
  }

  private _resolve: (value: TResolve) => void;
  resolve(value: TResolve) {
    this._isProcced = true;
    this._resolve(value);
  }
  private _reject: (e: Rejection) => void;
  reject(e: Rejection) {
    this._isProcced = true;
    this._reject(e);
  };
}

export class WheelItem extends Defered {
  constructor(internal = (i1: any, i2: any) => { return undefined; }, private readonly _sim: Simulation, private _waitFor: number, private _reinsert: (oldWaitFor: number) => void) {
    super((resolveIn, rejectIn) => { return internal(resolveIn, rejectIn); });
    if (_sim === undefined) return;
    this.timeStart = _sim.time;
  }
  private timeStart: number;
  get time() { return this.timeStart + this._waitFor; }
  get remainingTime() { return Math.max(0, this.time - this._sim.time); }
  set remainingTime(remainingTime: number) {
    this.waitFor += (remainingTime - this.remainingTime);
  }
  get waitFor() { return this._waitFor; }
  set waitFor(waitFor: number) {
    const oldWaitFor = this._waitFor;
    this._waitFor = waitFor;
    this._reinsert(oldWaitFor);
  }

  canceledBy(event: Defered, rej: Rejection) {
    event.then(() => { this.reject(rej); }).catch(() => {});
    return this;
  }
}