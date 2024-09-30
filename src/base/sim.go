package base

import (
	"errors"
	"fmt"
	"losim/src/utils"
	"strings"
)

type Sim struct {
	maxTime uint
	time    uint
	wheel   []*SimulationEvent

	isLogEnabled bool
	log          strings.Builder

	Units []*Unit
}

func NewSimulation(maxTime uint) *Sim {
	result := Sim{
		maxTime: maxTime,
	}
	result.Insert(maxTime)
	return &result
}

func NewSimulationDefault() *Sim {
	return NewSimulation(100000)
}

func (sim *Sim) EnableLog() *Sim {
	sim.isLogEnabled = true
	return sim
}

func (sim *Sim) IsLogEnabled() bool {
	return sim.isLogEnabled
}

func (sim *Sim) Log(system string, message string) {
	if sim.log.Len() > 0 {
		sim.log.WriteRune('\n')
	}
	sim.log.WriteString(fmt.Sprintf("[%v,%v] %v", sim.time, system, message))
}

func (sim *Sim) GetLog() string {
	return sim.log.String()
}

func (sim *Sim) Insert(waitFor uint) *SimulationEvent {
	result := SimulationEvent{
		parent:        sim,
		waitFor:       waitFor,
		timeStart:     sim.time,
		state:         true,
		OnProc:        utils.NewEventContainer[bool](),
	}

	result.insert()

	return &result
}

func (sim *Sim) Time() uint {
	return sim.time
}

func (sim *Sim) IsComplete() bool {
	return sim.time >= sim.maxTime
}

func (sim *Sim) WaitFinish() {
	for !sim.IsComplete() {
		sim.consume()
	}
}

func (sim *Sim) consume() (*SimulationEvent, error) {
	if sim.IsComplete() {
		return nil, errors.New("simulation is complete can't consume")
	}

	lastItem := len(sim.wheel) - 1

	if lastItem < 0 {
		return nil, errors.New("nothing to consume in Simulation")
	}

	result := sim.wheel[lastItem]
	sim.wheel = sim.wheel[:lastItem]

	sim.time = result.Time()
	result.isComplete = true
	result.OnProc.Proc(result.state)

	return result, nil
}
