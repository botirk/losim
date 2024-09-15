package simulation

import (
	"testing"
)

func TestTime(t *testing.T) {
	sim := NewSimulation(10000)

	if sim.Time() != 0 {
		t.Fatal(sim.Time())
	}
}

func TestWait(t *testing.T) {
	sim := NewSimulation(10000)

	e := sim.Insert(1000)

	e.Wait()

	if sim.Time() != 1000 {
		t.Fatal(sim.Time())
	}

	e.Wait()

	if sim.Time() != 1000 {
		t.Fatal(sim.Time())
	}
}

func TestProc(t *testing.T) {
	sim := NewSimulation(10000)

	e := sim.Insert(10000)

	if e.IsComplete() != false {
		t.Fatal(e.IsComplete())
	}

	proccedTime := uint(0)
	e.OnProc = func() {
		proccedTime = sim.Time()
	}

	e.Wait()

	if sim.Time() != 10000 {
		t.Fatal(sim.Time())
	}
	if proccedTime != 10000 {
		t.Fatal(proccedTime)
	}
	if e.IsComplete() != true {
		t.Fatal(e.IsComplete())
	}
}

func TestProcOrder(t *testing.T) {
	sim := NewSimulation(50000)

	e := sim.Insert(10000)
	proccedTime := uint(0)
	e.OnProc = func() {
		proccedTime = sim.Time()
	}

	e1 := sim.Insert(5000)
	proccedTime1 := uint(0)
	e1.OnProc = func() {
		proccedTime1 = sim.Time()
	}

	e2 := sim.Insert(25000)
	proccedTime2 := uint(0)
	e2.OnProc = func() {
		proccedTime2 = sim.Time()
	}

	e.Wait()
	e2.Wait()
	e1.Wait()

	if proccedTime != 10000 {
		t.Fatal(proccedTime)
	}
	if proccedTime1 != 5000 {
		t.Fatal(proccedTime1)
	}
	if proccedTime2 != 25000 {
		t.Fatal(proccedTime2)
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
