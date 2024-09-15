package simulation

import (
	"errors"
	"slices"
)

type Simulation struct {
	maxTime uint
	time    uint
	wheel   []*SimulationEvent
}

func (sim *Simulation) Insert(waitFor uint) *SimulationEvent {
	result := SimulationEvent{
		parent:    sim,
		waitFor:   waitFor,
		timeStart: sim.time,
		OnProc:    nil,
	}

	start := 0
	end := len(sim.wheel) - 1
	for start <= end {
		mid := (start + end) >> 1
		if sim.wheel[mid].Time() > result.Time() {
			start = mid + 1
		} else {
			end = mid - 1
		}
	}
	sim.wheel = slices.Insert(sim.wheel, start, &result)

	return &result
}

func (sim *Simulation) Time() uint {
	return sim.time
}

func (sim *Simulation) IsComplete() bool {
	return sim.time >= sim.maxTime
}

func (sim *Simulation) WaitFinish() {
	for !sim.IsComplete() {
		sim.consume()
	}
}

func (sim *Simulation) Len() int {
	return len(sim.wheel)
}

func (sim *Simulation) consume() (*SimulationEvent, error) {
	if (sim.IsComplete()) {
		return nil, errors.New("Simulation is complete can't consume")
	}

	lastItem := len(sim.wheel) - 1

	if lastItem < 0 {
		return nil, errors.New("nothing to consume in Simulation")
	}

	result := sim.wheel[lastItem]
	sim.wheel = sim.wheel[:lastItem]

	sim.time = result.Time()
	if result.OnProc != nil {
		result.OnProc()
	}
	result.isComplete = true

	return result, nil
}

func NewSimulation(maxTime uint) *Simulation {
	result := Simulation{
		maxTime: maxTime,
	}
	result.Insert(maxTime)
	return &result
}

type SimulationEvent struct {
	parent     *Simulation
	waitFor    uint
	timeStart  uint
	isComplete bool
	OnProc     func()
}

func (se *SimulationEvent) Time() uint {
	return se.timeStart + se.waitFor
}

func (se *SimulationEvent) Wait() {
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

func (se *SimulationEvent) IsComplete() bool {
	return se.isComplete
}

func (se *SimulationEvent) Remove() {
	start := 0
	end := se.parent.Len()
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
