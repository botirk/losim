package unit

import "testing"

func TestDeath(t *testing.T) {
	u := NewUnit("")

	u.health = 149

	u.TakeDamage(&DamageEvent{src: u, value: 50, dtype: TRUED})

	if u.health != 99 || u.dead != false {
		t.Fatal(u.health, u.dead)
	}

	u.TakeDamage(&DamageEvent{src: u, value: 100, dtype: TRUED})

	if u.health != 0 || u.dead != true {
		t.Fatal(u.health, u.dead)
	}
}

func TestDamageEventBasic(t *testing.T) {
	u := NewUnit("")

	u.health = 100

	got := 0
	value := 0.0

	r := u.OnTakeDamage.MustAdd(func(e DamageEvent) { got += 1; value = e.value })

	u.TakeDamage(&DamageEvent{src: u, value: 50, dtype: TRUED})

	if got != 1 || value != 50 {
		t.Fatal(got, value)
	}

	u.TakeDamage(&DamageEvent{src: u, value: 1, dtype: TRUED})

	if got != 2 || value != 1 {
		t.Fatal()
	}

	r()

	u.TakeDamage(&DamageEvent{src: u, value: 1, dtype: TRUED})

	if got != 2 || value != 1 {
		t.Fatal()
	}
}
