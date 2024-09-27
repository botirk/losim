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

func TestFlatDamageReduction(t *testing.T) {
	u := NewDefaultUnit()

	u.SetHealth(100)
	u.OnFlatDamageReduction.MustAdd(func(proc *DamageEvent) {
		proc.Value -= 10
	})

	e1 := u.CalcDamageReduction(DamageEvent{Value: 50, Src: u, Dtype: MAGICALD})
	e2 := u.CalcDamageReduction(DamageEvent{Value: 40, Src: u, Dtype: MAGICALD})

	if e1.Value != 40 {
		t.Fatal(e1)
	}

	if e2.Value != 30 {
		t.Fatal(e2)
	}
}

func TestPercentDamageReduction(t *testing.T) {
	u := NewDefaultUnit()

	u.SetHealth(100)
	u.OnPercentDamageReduction.MustAdd(func(proc *DamageEvent) {
		proc.Value /= 2
	})

	e1 := u.CalcDamageReduction(DamageEvent{Value: 50, Src: u, Dtype: MAGICALD})
	e2 := u.CalcDamageReduction(DamageEvent{Value: 40, Src: u, Dtype: MAGICALD})

	if e1.Value != 25 {
		t.Fatal(e1)
	}

	if e2.Value != 20 {
		t.Fatal(e2)
	}
}

func TestFinalDamageReduction(t *testing.T) {
	u := NewDefaultUnit()

	u.SetHealth(100)
	u.OnPercentDamageReduction.MustAdd(func(proc *DamageEvent) {
		proc.Value -= 15
	})

	e1 := u.CalcDamageReduction(DamageEvent{Value: 50, Src: u, Dtype: MAGICALD})
	e2 := u.CalcDamageReduction(DamageEvent{Value: 40, Src: u, Dtype: MAGICALD})

	if e1.Value != 35 {
		t.Fatal(e1)
	}

	if e2.Value != 25 {
		t.Fatal(e2)
	}
}

func TestComboDamageReduction(t *testing.T) {
	u := NewDefaultUnit()

	u.SetHealth(100)

	u.OnFlatDamageReduction.MustAdd(func(proc *DamageEvent) {
		proc.Value -= 10
	})
	u.OnPercentDamageReduction.MustAdd(func(proc *DamageEvent) {
		proc.Value /= 2
	})
	u.OnFinalDamageReduction.MustAdd(func(proc *DamageEvent) {
		proc.Value -= 5
	})

	e1 := u.CalcDamageReduction(DamageEvent{Value: 50, Src: u, Dtype: MAGICALD})
	e2 := u.CalcDamageReduction(DamageEvent{Value: 40, Src: u, Dtype: MAGICALD})

	if e1.Value != 15 {
		t.Fatal(e1)
	}

	if e2.Value != 10 {
		t.Fatal(e2)
	}
}
