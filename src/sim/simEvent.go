package sim

import "slices"

type SimulationEvent[T Actor] struct {
	parent     *Sim[T]
	waitFor    uint
	timeStart  uint
	isComplete bool
	OnProc     func()
}

func (se *SimulationEvent[T]) Time() uint {
	return se.timeStart + se.waitFor
}

func (se *SimulationEvent[T]) Wait() {
	if se.parent.IsComplete() || se.IsComplete() {
		return
	}

	for {
		next, err := se.parent.consume()
		if err != nil {
			break
		}
		if next == se {
			break
		}
	}
}

func (se *SimulationEvent[T]) IsComplete() bool {
	return se.isComplete
}

func (se *SimulationEvent[T]) Remove() {
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

func (se *SimulationEvent[T]) insert() {
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

func (se *SimulationEvent[T]) Reinsert(waitFor uint) {
	if se.isComplete {
		return
	}
	se.Remove()
	se.isComplete = false
	se.timeStart = se.parent.time
	se.waitFor = waitFor
	se.insert()
}
