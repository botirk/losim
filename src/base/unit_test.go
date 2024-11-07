package base

import (
	"testing"
)

func TestUnitBaseStats(t *testing.T) {
	unit := NewDefaultUnit(NewSimulationDefault())

	if unit.Health() != 100 || unit.MaxHealth() != 100 {
		t.Fail()
	}

	if unit.Dead() != false {
		t.Fail()
	}
}