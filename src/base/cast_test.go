package base

import "testing"

func TestActionCastCooldown(t *testing.T) {
	sim := NewSimulationDefault()
	u := NewDefaultUnit(sim)
	a := NewDefaultAction(u)

	result := a.Cast(0).Wait()

	if !result || !a.Castable(0) {
		t.Fatal(result, sim.Time(), a.Castable(0))
	}

	a.CooldownTime = func() uint { return 500 }
	result = a.Cast(0).Wait()

	if !result || !a.IsCooldown() || a.Castable(0) {
		t.Fatal(result, a.IsCooldown(), a.CooldownTime(), a.Castable(0))
	}

	result = a.Cast(0).Wait()

	if result || !a.IsCooldown() {
		t.Fatal(result, a.CooldownTime())
	}
}
