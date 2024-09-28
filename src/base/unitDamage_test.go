package base

import (
	"math"
	"testing"
)

func TestDeath(t *testing.T) {
	u := NewDefaultUnit(NewSimulationDefault())

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
	u := NewDefaultUnit(NewSimulationDefault())

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
	u := NewDefaultUnit(NewSimulationDefault())

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
	u := NewDefaultUnit(NewSimulationDefault())

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
	u := NewDefaultUnit(NewSimulationDefault())

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
	u := NewDefaultUnit(NewSimulationDefault())

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

func TestCalcArmorReduction(t *testing.T) {
	u := NewDefaultUnit(NewSimulationDefault())

	v1 := u.CalcArmorDamageReduction(DamageEvent{Src: u, Value: 100, Dtype: PHYSICALD})

	if v1.Value != 100 {
		t.Fatal(v1.Value)
	}

	u.armor = 100

	v2 := u.CalcArmorDamageReduction(DamageEvent{Src: u, Value: 100, Dtype: PHYSICALD})

	if v2.Value != 50 {
		t.Fatal(v2.Value)
	}

	v3 := u.CalcMrDamageReduction(DamageEvent{Src: u, Value: 100, Dtype: MAGICALD})

	if v3.Value != 100 {
		t.Fatal(v3.Value)
	}

	u.mr = 200

	v4 := u.CalcMrDamageReduction(DamageEvent{Src: u, Value: 100, Dtype: MAGICALD})

	if math.Abs(v4.Value - 100 * 0.3333) > 0.1 {
		t.Fatal(v4.Value)
	}
}

func TestTakePhysicalDamaage(t *testing.T) {
	u := NewDefaultUnit(NewSimulationDefault())

	u.armor = 100

	u.health = 100

	result := u.TakeDamage(DamageEvent{Src: u, Value: 10, Dtype: PHYSICALD })

	if result.Value != 5 {
		t.Fatal(result)
	}

	if (u.health != 95) {
		t.Fatal(u.health)
	}
}
