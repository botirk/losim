package unit

import (
	"losim/src/simulation"
	"testing"
)

func TestUnitBaseStats(t *testing.T) {
	unit := NewUnit(simulation.NewSimulation())

	if unit.Health() != 0 || unit.MaxHealth() != 0 {
		t.Fail()
	}

	if unit.Dead() != false {
		t.Fail()
	}
}
