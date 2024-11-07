package base

import "testing"

func TestReinsert(t *testing.T) {
	sim := NewSimulationDefault()

	e := sim.Insert(5000)

	e.Reinsert(7000)

	e.Wait()

	if sim.Time() != 7000 {
		t.Fatal(sim.Time())
	}
}

func TestRemoved(t *testing.T) {
	sim := NewSimulationDefault()

	e := sim.Insert(5000)

	len1 := len(sim.wheel)
	e.Remove()
	newLen := len(sim.wheel)

	if newLen >= len1 {
		t.Fatal(newLen, len1)
	}

	e.Wait()

	if sim.Time() != 0 {
		t.Fatal(sim.Time())
	}
}

func TestProc(t *testing.T) {
	sim := NewSimulationDefault()

	e := sim.Insert(10000)

	if e.IsComplete() != false {
		t.Fatal(e.IsComplete())
	}

	proccedTime := uint(0)
	e.OnProc.MustAdd(func(proc bool) { proccedTime = sim.Time() })

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
	sim := NewSimulationDefault()

	e := sim.Insert(10000)
	proccedTime := uint(0)

	e.OnProc.MustAdd(func(proc bool) { proccedTime = sim.Time() })

	e1 := sim.Insert(5000)
	proccedTime1 := uint(0)
	e1.OnProc.MustAdd(func(proc bool) { proccedTime1 = sim.Time() })

	e2 := sim.Insert(25000)
	proccedTime2 := uint(0)
	e2.OnProc.MustAdd(func(proc bool) { proccedTime2 = sim.Time() })

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

func TestWait(t *testing.T) {
	sim := NewSimulationDefault()

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

func TestRemaining(t *testing.T) {
	sim := NewSimulationDefault()

	e := sim.Insert(1000)

	e1 := sim.Insert(300)

	if e.RemainingTime() != 1000 || e1.RemainingTime() != 300 {
		t.Fatal(e.RemainingTime(), e1.RemainingTime())
	}

	e1.Wait()

	if e.RemainingTime() != 700 || e1.RemainingTime() != 0 {
		t.Fatal(e.RemainingTime(), e1.RemainingTime())
	}

	e.Wait()

	if e.RemainingTime() != 0 || e1.RemainingTime() != 0 {
		t.Fatal(e.RemainingTime(), e1.RemainingTime())
	}
}

func TestSetRemaining(t *testing.T) {
	sim := NewSimulationDefault()

	e := sim.Insert(1000)

	e1 := sim.Insert(300)

	if e.RemainingTime() != 1000 || e1.RemainingTime() != 300 {
		t.Fatal(e.RemainingTime(), e1.RemainingTime())
	}

	e1.Wait()

	if e.RemainingTime() != 700 || e1.RemainingTime() != 0 {
		t.Fatal(e.RemainingTime(), e1.RemainingTime())
	}

	e.SetRemainingTime(500)

	if e.RemainingTime() != 500 {
		t.Fatal(e.RemainingTime())
	}

	e.Wait()

	if sim.Time() != 800 {
		t.Fatal(sim.Time())
	}
}

func TestWaitFor(t *testing.T) {
	sim := NewSimulationDefault()

	e := sim.Insert(1000)

	e1 := sim.Insert(300)

	if e.RemainingTime() != 1000 || e1.RemainingTime() != 300 {
		t.Fatal(e.RemainingTime(), e1.RemainingTime())
	}

	e1.Wait()

	if e.WaitFor() != 1000 {
		t.Fatal(e.WaitFor())
	}
}

func TestSetWaitFor(t *testing.T) {
	sim := NewSimulationDefault()

	e := sim.Insert(1000)

	e1 := sim.Insert(300)

	if e.RemainingTime() != 1000 || e1.RemainingTime() != 300 {
		t.Fatal(e.RemainingTime(), e1.RemainingTime())
	}

	e1.Wait()

	if e.WaitFor() != 1000 {
		t.Fatal(e.WaitFor())
	}

	e.SetWaitFor(1100)

	if e.WaitFor() != 1100 {
		t.Fatal(e.WaitFor())
	}

	e.Wait()

	if e.Time() != 1100 {
		t.Fatal(e.Time())
	}
}

func TestFinish(t *testing.T) {
	sim := NewSimulationDefault()

	e := sim.Insert(1000)

	e.Finish(false)

	e.Wait()

	if sim.Time() != 0 {
		t.Fatal(sim.Time())
	}
}

func TestFinish2(t *testing.T) {
	sim := NewSimulationDefault()

	e := sim.Insert(1000)

	e1 := sim.Insert(100)
	e1.OnProc.MustAdd(func(proc bool) { e.Finish(false) })
	sim.Insert(200)
	e2 := sim.Insert(300)

	result := e.Wait()

	if sim.Time() != 100 && result != false {
		t.Fatal(sim.Time(), result)
	}

	e1.Wait()
	if sim.Time() != 100 {
		t.Fatal(sim.Time())
	}

	e2.Wait()
	if sim.Time() != 300 {
		t.Fatal(sim.Time())
	}
}
