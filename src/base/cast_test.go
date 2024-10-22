package base

import "testing"

func TestCastCooldown(t *testing.T) {
	sim := NewSimulationDefault()
	u := NewDefaultUnit(sim)
	a := NewDefaultAction(u)

	result := a.Cast().Wait()

	if !result || !a.Castable() {
		t.Fatal(result, sim.Time(), a.Castable())
	}

	a.CooldownTime = func() uint { return 500 }
	result = a.Cast().Wait()

	if !result || !a.IsCooldown() || a.Castable() {
		t.Fatal(result, a.IsCooldown(), a.CooldownTime(), a.Castable())
	}

	result = a.Cast().Wait()

	if result || !a.IsCooldown() {
		t.Fatal(result, a.CooldownTime())
	}
}

func TestCastOwner(t *testing.T) {
	sim := NewSimulationDefault()
	u := NewDefaultUnit(sim)
	a := NewDefaultAction(u)

	a.CastTime = func() uint { return 0 }

	c := a.Cast()

	cur, err := u.CurrentCast()

	if err == nil || c.IsActive() {
		t.Fatal(cur, err, c.IsActive())
	}

	a.CastTime = func() uint { return 500 }

	c = a.Cast()

	cur, err = u.CurrentCast()

	if err != nil || !c.IsActive() {
		t.Fatal(cur, err, c.IsActive())
	}
}

func TestCastLong(t *testing.T) {
	sim := NewSimulationDefault()
	u := NewDefaultUnit(sim)
	a := NewDefaultAction(u)

	a.CastTime = func() uint { return 500 }
	a.CooldownTime = func() uint { return 2000 }

	result := a.Cast().Wait()

	if !result || !a.IsCooldown() || a.Castable() {
		t.Fatal(result, a.IsCooldown(), a.CooldownTime(), a.Castable())
	}

	if sim.Time() != 500 {
		t.Fatal(sim.Time())
	}
}

func TestCastFunctional(t *testing.T) {
	sim := NewSimulationDefault()
	u := NewDefaultUnit(sim)
	a := NewDefaultAction(u)

	a.CastTime = func() uint { return 500 }
	a.CooldownTime = func() uint { return 2000 }

	cast := a.Cast()

	proc1 := false

	cast.MustAdd(func(proc bool) { proc1 = true })

	cast.Wait()
	
	if proc1 == false {
		t.Fatal(proc1, sim.Time())
	}
}

func TestCastProcs(t *testing.T) {
	sim := NewSimulationDefault()
	u := NewDefaultUnit(sim)
	a := NewDefaultAction(u)

	cast := NewCast(a)

	os := 0
	of := 0
	cast.OnStartCast.MustAdd(func(proc void) {
		os += 1
	})
	cast.OnFinishCast.MustAdd(func(proc void) {
		of += 1
	})

	cast.Cast().Wait()

	if os != 1 && of != 1 {
		t.Fatal(os, of)
	}
}
