import test from 'node:test'
import assert from 'node:assert/strict'

import { Wheel } from './wheel.ts'

test('wheelItem inserted & removed & reinserted & isActive & time', () => {
    const wheel = new Wheel(10 * 10000)
    const wItem = wheel.createItem(13)

    assert.equal(wItem.time, 13)

    assert.equal(wItem.isActive(), true)
    assert.equal(wheel.has(wItem), true)

    wItem.remove()

    assert.equal(wItem.isActive(), false)
    assert.equal(wheel.has(wItem), false)

    wItem.reinsert(0)

    assert.equal(wItem.isActive(), true)
    assert.equal(wheel.has(wItem), true)
})

test('multiple insert & run', () => {
    const wheel = new Wheel(10 * 10000)

    assert.equal(wheel.maxTime, 10 * 10000)

    const wItem1 = wheel.createItem(13)
    const wItem2 = wheel.createItem(14)
    const wItem3 = wheel.createItem(12)
    const wItem4 = wheel.createItem(14)

    let count = 0
    const countMap = new Map()
    const timeMap = new Map()

    wItem1.proc = () => {
        countMap.set(wItem1, count)
        timeMap.set(wItem1, wheel.time)
        count += 1
    }

    wItem2.proc = () => {
        countMap.set(wItem2, count)
        timeMap.set(wItem2, wheel.time)
        count += 1
    }

    wItem3.proc = () => {
        countMap.set(wItem3, count)
        timeMap.set(wItem3, wheel.time)
        count += 1
    }

    wItem4.proc = () => {
        countMap.set(wItem4, count)
        timeMap.set(wItem4, wheel.time)
        count += 1
    }

    wheel.run()

    assert.equal(wheel.time, 14)

    assert.equal(countMap.get(wItem1), 1)
    assert.equal(countMap.get(wItem2), 3)
    assert.equal(countMap.get(wItem3), 0)
    assert.equal(countMap.get(wItem4), 2)
})