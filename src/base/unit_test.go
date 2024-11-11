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

	if unit.Ad() != 1 {
		t.Fail()
	}

	if unit.As() != 0.5 {
		t.Fatal()
	}

	if unit.AsAnimation() != 0.25 {
		t.Fatal()
	}
}
