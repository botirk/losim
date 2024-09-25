package unit

import (
	"testing"
)

func TestDeath(t *testing.T) {
	u := NewDefaultUnit()

	u.SetHealth(149)

	u.TakeDamage(DamageEvent{Src: u, Value: 50, Dtype: TRUED})

	if u.Health() != 99 || u.Dead() != false {
		t.Fatal(u.Health(), u.Dead())
	}

	u.TakeDamage(DamageEvent{Src: u, Value: 100, Dtype: TRUED})

	if u.Health() != 0 || u.Dead() != true {
		t.Fatal(u.Health(), u.Dead())
	}
}

func TestDamageEventBasic(t *testing.T) {
	u := NewDefaultUnit()

	u.SetHealth(100)

	got := 0
	value := 0.0

	r := u.OnTakeDamage.MustAdd(func(e DamageEvent) { got += 1; value = e.Value })

	u.TakeDamage(DamageEvent{Src: u, Value: 50, Dtype: TRUED})

	if got != 1 || value != 50 {
		t.Fatal(got, value)
	}

	u.TakeDamage(DamageEvent{Src: u, Value: 1, Dtype: TRUED})

	if got != 2 || value != 1 {
		t.Fatal()
	}

	r()

	u.TakeDamage(DamageEvent{Src: u, Value: 1, Dtype: TRUED})

	if got != 2 || value != 1 {
		t.Fatal()
	}
}
