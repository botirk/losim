package unitSimTest

import (
	"losim/src/sim"
	"losim/src/unit"
	"strings"
	"testing"
)

func TestAddUnit(t *testing.T) {
	sim := sim.NewSimulation[*unit.Unit](100000)
	sim.EnableLog()

	unit := unit.NewDefaultUnitAddToSim(sim)

	log := sim.GetLog()

	if !strings.Contains(log, unit.Name()) || !strings.Contains(log, " actor added") {
		t.Fatal(log)
	}

	if len(sim.Actors()) != 1 {
		t.Fatal(len(sim.Actors()))
	}
}
