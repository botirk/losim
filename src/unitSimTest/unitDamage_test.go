package unitSimTest

import (
	"losim/src/sim"
	"losim/src/unit"
	"testing"
)

func TestDeath(t *testing.T) {
	u := unit.NewDefaultUnit(sim.NewSimulation[*unit.Unit](10000))

	u.SetHealth(149)

	u.TakeDamage(unit.DamageEvent{Src: u, Value: 50, Dtype: unit.TRUED})

	if u.Health() != 99 || u.Dead() != false {
		t.Fatal(u.Health(), u.Dead())
	}

	u.TakeDamage(unit.DamageEvent{Src: u, Value: 100, Dtype: unit.TRUED})

	if u.Health() != 0 || u.Dead() != true {
		t.Fatal(u.Health(), u.Dead())
	}
}

func TestDamageEventBasic(t *testing.T) {
	u := unit.NewDefaultUnit(sim.NewSimulation[*unit.Unit](10000))

	u.SetHealth(100)

	got := 0
	value := 0.0

	r := u.OnTakeDamage.MustAdd(func(e unit.DamageEvent) { got += 1; value = e.Value })

	u.TakeDamage(unit.DamageEvent{Src: u, Value: 50, Dtype: unit.TRUED})

	if got != 1 || value != 50 {
		t.Fatal(got, value)
	}

	u.TakeDamage(unit.DamageEvent{Src: u, Value: 1, Dtype: unit.TRUED})

	if got != 2 || value != 1 {
		t.Fatal()
	}

	r()

	u.TakeDamage(unit.DamageEvent{Src: u, Value: 1, Dtype: unit.TRUED})

	if got != 2 || value != 1 {
		t.Fatal()
	}
}
