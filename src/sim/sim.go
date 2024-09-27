package sim

import (
	"errors"
	"fmt"
	"strings"
)

func NewSimulation[T Actor](maxTime uint) *Sim[T] {
	result := Sim[T]{
		maxTime: maxTime,
	}
	result.Insert(maxTime)
	return &result
}

type DefaultActor struct{}

func (da DefaultActor) Name() string {
	return "Default Actor"
}

func NewSimulationDefault() *Sim[DefaultActor] {
	return NewSimulation[DefaultActor](100000)
}

type Sim[T Actor] struct {
	maxTime uint
	time    uint
	wheel   []*SimulationEvent[T]

	isLogEnabled bool
	log          strings.Builder

	actors []T
}

func (sim *Sim[T]) EnableLog() *Sim[T] {
	sim.isLogEnabled = true
	return sim
}

func (sim *Sim[T]) IsLogEnabled() bool {
	return sim.isLogEnabled
}

func (sim *Sim[T]) Log(system string, message string) {
	if sim.log.Len() > 0 {
		sim.log.WriteRune('\n')
	}
	sim.log.WriteString(fmt.Sprintf("[%v,%v] %v", sim.time, system, message))
}

func (sim *Sim[T]) GetLog() string {
	return sim.log.String()
}

func (sim *Sim[T]) Insert(waitFor uint) *SimulationEvent[T] {
	result := SimulationEvent[T]{
		parent:    sim,
		waitFor:   waitFor,
		timeStart: sim.time,
		OnProc:    nil,
	}

	result.insert()

	return &result
}

func (sim *Sim[T]) Time() uint {
	return sim.time
}

func (sim *Sim[T]) IsComplete() bool {
	return sim.time >= sim.maxTime
}

func (sim *Sim[T]) WaitFinish() {
	for !sim.IsComplete() {
		sim.consume()
	}
}

func (sim *Sim[T]) consume() (*SimulationEvent[T], error) {
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
	if result.OnProc != nil {
		result.OnProc()
	}
	result.isComplete = true

	return result, nil
}

func (sim *Sim[T]) AddActor(actor T) {
	sim.actors = append(sim.actors, actor)
	sim.Log("sim", fmt.Sprintf("%v actor added", actor.Name()))
}

func (sim *Sim[T]) Actors() []T {
	return sim.actors
}
