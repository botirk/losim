package base

import "testing"

func TestBaseAction(t *testing.T) {
	a := NewDefaultAction(*NewDefaultUnit(NewSimulationDefault()))

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
}
