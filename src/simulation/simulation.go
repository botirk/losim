package simulation

import (
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

// Can return nil
func (sim *Simulation) consume() *SimulationEvent {
	lastItem := len(sim.wheel) - 1

	if lastItem < 0 {
		return nil
	}

	result := sim.wheel[lastItem]
	sim.wheel = sim.wheel[:lastItem]

	sim.time = result.Time()
	if result.OnProc != nil {
		result.OnProc()
	}
	result.isComplete = true

	return result
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
		next := se.parent.consume()
		if next == nil {
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
