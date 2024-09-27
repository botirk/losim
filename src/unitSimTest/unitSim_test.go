package unitSimTest

import (
	"losim/src/sim"
	"losim/src/unit"
	"regexp"
	"strings"
	"testing"
)

func TestAddUnit(t *testing.T) {
	sim := sim.NewSimulation[*unit.Unit](100000).EnableLog()

	unit := unit.NewDefaultUnitAddToSim(sim)

	log := sim.GetLog()

	if !strings.Contains(log, unit.Name()) || !strings.Contains(log, " actor added") {
		t.Fatal(log)
	}

	if len(sim.Actors()) != 1 {
		t.Fatal(len(sim.Actors()))
	}
}

func TestTakeDamageLog(t *testing.T) {
	sim := sim.NewSimulation[*unit.Unit](100000).EnableLog()

	u := unit.NewDefaultUnitAddToSim(sim)
	u.SetHealth(1000)

	u.TakeDamage(unit.DamageEvent{Src: u, Value: 100, Dtype: unit.TRUED})

	log := sim.GetLog()

	m, _ := regexp.MatchString(`\[0,unitDamage\] Default Unit took 100 true damage from Default Unit`, log) 
	if !m {
		t.Fatal(log, m)
	}
}
