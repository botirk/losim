package base

import (
	"testing"
)

func TestTime(t *testing.T) {
	sim := NewSimulationDefault()

	if sim.Time() != 0 {
		t.Fatal(sim.Time())
	}
}

func TestMaxTime(t *testing.T) {
	sim := NewSimulation(13333)

	if sim.IsComplete() != false {
		t.Fatal(sim.IsComplete())
	}

	e := sim.Insert(15000)

	sim.WaitFinish()

	if sim.Time() != 13333 {
		t.Fatal(sim.Time())
	}

	if sim.IsComplete() != true {
		t.Fatal(sim.IsComplete())
	}

	e.Wait()

	if sim.Time() != 13333 {
		t.Fatal(sim.Time())
	}
}

func TestConsumeMustReturnErrors(t *testing.T) {
	sim := NewSimulationDefault()

	sim.Insert(20000)

	e1, _ := sim.consume()

	if e1 == nil {
		t.Fatal(e1)
	}

	e2, _ := sim.consume()

	if e2 == nil {
		t.Fatal(e2)
	}

	_, err := sim.consume()

	if err == nil {
		t.Fatal(err)
	}

	if !sim.IsComplete() {
		t.Fatal(sim.IsComplete())
	}
}

func TestLog(t *testing.T) {
	sim := NewSimulationDefault()

	sim.EnableLog()

	sim.Log("Test", "Test log")

	log := sim.GetLog()

	if log != "[0,Test] Test log" {
		t.Fatal(log)
	}
}
