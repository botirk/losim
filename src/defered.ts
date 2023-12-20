
export enum Rejection {
  SimulationStopped = 0,
  UnitDeath = 1,
  RemoveEventListener = 2,
  Canceled = 3,
}

export class Defered<TResolve = void> extends Promise<TResolve> {
  constructor(internal = (i1: any, i2: any) => { return undefined; }) {
    let resolve: (value: TResolve) => void;
    let reject: (e: Rejection) => void;
    super((resolveIn, rejectIn) => { resolve = resolveIn; reject = rejectIn; return internal(resolve, reject); });
    this.resolve = resolve;
    this.reject = reject;
  }
  resolve: (value: TResolve) => void;
  reject: (e: Rejection) => void;
}