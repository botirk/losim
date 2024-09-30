package base

import "testing"

func TestBaseAction(t *testing.T) {
	a := NewDefaultAction(NewDefaultUnit(NewSimulationDefault()))

	if a.CastTime() != 0 {
		t.Fatal(a.CastTime())
	}

	if a.CooldownTime() != 0 {
		t.Fatal(a.CooldownTime())
	}

	if a.ManaCost() != 0 {
		t.Fatal(a.ManaCost())
	}

	if a.Level() != 0 {
		t.Fatal(a.Level())
	}

	if a.IsCancelableByUser != false || a.IsCooldownFinishedOnInterrupt != false || a.IsUltimate != false {
		t.Fatal(a.IsCancelableByUser, a.IsCooldownFinishedOnInterrupt, a.IsUltimate)
	}

	if a.IsCooldown() {
		t.Fatal(a.IsCooldown())
	}
}

func TestCooldown(t *testing.T) {
	a := NewDefaultAction(NewDefaultUnit(NewSimulationDefault()))

	a.CooldownTime = func() uint { return 500 }

	a.StartCooldown()

	if a.RemainingCooldown() != 500 || !a.IsCooldown() {
		t.Fatal(a.RemainingCooldown(), a.IsCooldown())
	}

	a.FinishCooldown()

	if a.IsCooldown() || a.RemainingCooldown() != 0 {
		t.Fatal(a.IsCooldown(), a.RemainingCooldown())
	}
}
