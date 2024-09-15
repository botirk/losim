import { Simulation } from "./simulation";

export enum Rejection {
  SimulationStopped = 0,
  UnitDeath = 1,
  RemoveEventListener = 2,
  Canceled = 3,
  TargetDeath = 4,
}

export class Defered extends Promise<boolean> {
  constructor(internal = (i1: any, i2: any) => { return undefined; }) {
    let resolve: (value: boolean) => void;
    super((resolveIn, rejectIn) => { resolve = resolveIn; return internal(resolveIn, rejectIn); });
    this._resolve = resolve;
  }

  private _result?: boolean;
  get result(): boolean | undefined {
    return this._result;
  }

  private _resolve: (value: boolean) => void;
  resolve(value: boolean) {
    this._result = value;
    this._resolve(value);
  }
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
}