package base

import (
	"regexp"
	"strings"
	"testing"
)

func TestAddUnit(t *testing.T) {
	sim := NewSimulationDefault().EnableLog()

	unit := NewDefaultUnit(sim)

	log := sim.GetLog()

	if !strings.Contains(log, unit.Name()) || !strings.Contains(log, " unit added") {
		t.Fatal(log)
	}

	if len(sim.Units) != 1 {
		t.Fatal(len(sim.Units))
	}
}

func TestTakeDamageLog(t *testing.T) {
	sim := NewSimulationDefault().EnableLog()

	u := NewDefaultUnit(sim)
	u.SetHealth(1000)

	u.TakeDamage(DamageEvent{Src: u, Value: 100, Dtype: TRUED})

	log := sim.GetLog()

	m, _ := regexp.MatchString(`\[0,unitDamage\] default took 100 true damage from default`, log)
	if !m {
		t.Fatal(log, m)
	}
}
