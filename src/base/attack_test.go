package base

import "testing"

func TestAttackInterfaces(t *testing.T) {
	sim := NewSimulationDefault()
	unit1 := NewDefaultUnit(sim)
	unit2 := NewDefaultUnit(sim)

	result := unit1.attack.Cast(unit2).Wait()

	if result != true && sim.Time() <= 0 {
		t.Fatal(result, sim.Time())
	}
}

func TestAttackSelf(t *testing.T) {
	sim := NewSimulationDefault()
	unit1 := NewDefaultUnit(sim)

	result := unit1.attack.Cast(unit1).Wait()

	if result != false && sim.Time() != 0 {
		t.Fatal(result, sim.Time())
	}
}
