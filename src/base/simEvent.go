package base

import (
	"losim/src/utils"
	"math"
	"slices"
)

type SimulationEvent struct {
	parent        *Sim
	waitFor       uint
	timeStart     uint
	isComplete    bool
	state         bool

	OnProc utils.EventContainer[bool]
}

func (se *SimulationEvent) Time() uint {
	return se.timeStart + se.waitFor
}

func (se *SimulationEvent) Wait() bool {
	// se.Finish used or event popped or simulation ended
	for !se.IsComplete() {
		// pop next SimEvent
		se.parent.consume()
	}
	return se.state
}

func (se *SimulationEvent) IsComplete() bool {
	return se.parent.IsComplete() || se.isComplete
}

func (se *SimulationEvent) Remove() {
	start := 0
	end := len(se.parent.wheel)
	for start <= end {
		mid := (start + end) >> 1
		if se.parent.wheel[mid] == se {
			start = mid
			break
		} else if se.parent.wheel[mid].Time() > se.Time() {
			start = mid + 1
		} else {
			end = mid - 1
		}
	}
	if se.parent.wheel[start] == se {
		se.parent.wheel = slices.Delete(se.parent.wheel, start, start+1)
	}
	se.isComplete = true
}

func (se *SimulationEvent) insert() {
	start := 0
	end := len(se.parent.wheel) - 1
	for start <= end {
		mid := (start + end) >> 1
		if se.parent.wheel[mid].Time() > se.Time() {
			start = mid + 1
		} else {
			end = mid - 1
		}
	}
	se.parent.wheel = slices.Insert(se.parent.wheel, start, se)
}

func (se *SimulationEvent) Reinsert(waitFor uint) {
	if se.IsComplete() {
		return
	}
	se.Remove()
	se.isComplete = false
	se.timeStart = se.parent.time
	se.waitFor = waitFor
	se.insert()
}

func (se *SimulationEvent) RemainingTime() uint {
	return uint(math.Max(0, float64(se.Time())-float64(se.parent.Time())))
}

func (se *SimulationEvent) SetRemainingTime(rt uint) {
	if !se.IsComplete() {
		se.Reinsert(rt)
	}
}

func (se *SimulationEvent) WaitFor() uint {
	return se.waitFor
}

func (se *SimulationEvent) SetWaitFor(wf uint) {
	if se.IsComplete() {
		return
	}
	se.Remove()
	se.isComplete = false
	se.waitFor = wf
	se.insert()
}

func (se *SimulationEvent) Finish(state bool) {
	se.isComplete = true
	se.state = state
}
