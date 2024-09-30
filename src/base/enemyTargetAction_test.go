package base

import "testing"

func TestETACastable(t *testing.T) {
	sim := NewSimulationDefault()
	u := NewDefaultUnit(sim)
	a := NewDefaultEnemyTargetAction(u)

	if a.Castable(u) {
		t.Fatal(a.Castable(u))
	}

	u2 := NewDefaultUnit(sim)

	if !a.Castable(u2) {
		t.Fatal(a.Castable(u))
	}
}

func TestETACast(t *testing.T) {
	sim := NewSimulationDefault()
	u := NewDefaultUnit(sim)
	a := NewDefaultEnemyTargetAction(u)

	u2 := NewDefaultUnit(sim)

	result := a.Cast(u).Wait()

	if result {
		t.Fatal(result, sim.Time())
	}

	a.CooldownTime = func() uint { return 500 }
	result = a.Cast(u2).Wait()

	if !result || !a.IsCooldown() {
		t.Fatal(result, a.IsCooldown(), a.CooldownTime())
	}
}
