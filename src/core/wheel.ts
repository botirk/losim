
class WheelItem {
    constructor(wheel: Wheel, time: number) {
        this._parent = wheel
        this._time = time
    }

    private _time: number
    get time() {
        return this._time
    }

    private _parent: Wheel

    checkChildOf(wheel: Wheel) {
        if (this._parent !== wheel) throw new Error('trying operation with wrong wheel')
    }

    reinsert(time: number = this.time) {
        this._parent.remove(this)
        this._time = time
        this._parent.insert(this)
    }

    remove() {
        this._parent.remove(this)
    }

    isActive() {
        return this._parent.has(this)
    }

    proc?: () => void
}

export class Wheel {
    constructor(maxTime: number) {
        this._maxTime = maxTime
    }

    private _time = 0
    get time() {
        return this._time
    }

    private _maxTime = 0
    get maxTime() {
        return this._maxTime
    }

    private sortedItems: WheelItem[] = []
    private setItems: Set<WheelItem> = new Set()

    createItem(time: number): WheelItem {
        const item = new WheelItem(this, time)
        this.insert(item)
        return item
    }

    has(item: WheelItem): boolean {
        item.checkChildOf(this)
        return this.setItems.has(item)
    }

    insert(item: WheelItem) {
        item.checkChildOf(this)
        if (this.setItems.has(item)) throw new Error('Cant insert, item already exists')

        let left = 0, right = this.sortedItems.length - 1

        while (left <= right) {
            let mid = Math.floor((left + right) / 2)
            if (this.sortedItems[mid].time === item.time) {
                left = mid
                break
            } else if (this.sortedItems[mid].time > item.time) {
                right = mid - 1
            } else {
                left = mid + 1
            }
        }
        
        this.sortedItems.splice(left, 0, item)
        this.setItems.add(item)
    }

    remove(item: WheelItem) {
        item.checkChildOf(this)
        if (!this.has(item)) return

        let left = 0, right = this.sortedItems.length - 1

        while (left <= right) {
            let mid = Math.floor((left + right) / 2)
            if (this.sortedItems[mid] === item) {
                left = mid
                break
            } else if (this.sortedItems[mid].time > item.time) {
                right = mid - 1
            } else {
                left = mid + 1
            }
        }

        this.sortedItems.splice(left, 1)
        this.setItems.delete(item)
    }

    run() {
        while (this.sortedItems[0]) {
            if (this._time >= this._maxTime) throw new Error('max time reached')
            const next = this.sortedItems[0]
            this._time = next.time
            this.sortedItems.splice(0, 1)
            this.setItems.delete(next)
            next.proc?.()
        }
    }
}

