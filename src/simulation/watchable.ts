
export class Watchable<T> {
  constructor(private _value: T) {}
  set value(value: T) {
    if (this._value === value) return;
    const old = this._value;
    this._value = value;
    for (const listener of this._callbacks) listener(old, value);
  }
  get value() {
    return this._value;
  }

  private _callbacks: ((oldValue: T, newValue: T) => void)[] = [];
  callback(cb: typeof this._callbacks[0]) {
    this._callbacks.push(cb);
    return () => {
      const i = this._callbacks.indexOf(cb);
      if (i !== -1) this._callbacks.splice(i, 1);
    }
  }

  promise(stopper: Promise<any>, cond?: T): Promise<[oldValue: T, newValue: T]>;
  promise(stopper: Promise<any>, cond?: (oldValue: T, newValue: T) => boolean): Promise<[oldValue: T, newValue: T]>;
  promise(stopper: Promise<any>, cond?: any) {
    return new Promise<[oldValue: T, newValue: T]>((resolve) => {
      const cancel = this.callback((oldValue, newValue) => {
        if (cond === undefined || cond === newValue || (typeof(cond) === "function" && cond(oldValue, newValue))) {
          cancel();
          resolve([ oldValue, newValue ]);
        }
      });
      stopper.then(() => cancel());
    });
  }
}