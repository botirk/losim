package simulation

type Simulation struct {
	time uint

}

func (sim *Simulation) Time() uint {
	return sim.time
}

func NewSimulation() Simulation {
	return Simulation{}
}
