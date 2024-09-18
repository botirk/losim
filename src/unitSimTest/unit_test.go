package unitSimTest

import (
	"losim/src/sim"
	"losim/src/unit"
	"strings"
	"testing"
)

func TestUnitBaseStats(t *testing.T) {
	unit := unit.NewDefaultUnit(sim.NewSimulation[*unit.Unit](100000))

	if unit.Health() != 0 || unit.MaxHealth() != 0 {
		t.Fail()
	}

	if unit.Dead() != false {
		t.Fail()
	}
}

func TestAddUnit(t *testing.T) {
	sim := sim.NewSimulation[*unit.Unit](100000)
	sim.EnableLog()

	unit := unit.NewDefaultUnit(sim)

	log := sim.GetLog()

	if (!strings.Contains(log, unit.Name()) || !strings.Contains(log, "added")) {
		t.Fatal(log)
	}

	if (len(sim.Actors()) != 1) {
		t.Fatal(len(sim.Actors()))
	}
}