package unit

import (
	"testing"
)

func TestUnitBaseStats(t *testing.T) {
	unit := NewUnit("")

	if unit.Health() != 0 || unit.MaxHealth() != 0 {
		t.Fail()
	}

	if unit.Dead() != false {
		t.Fail()
	}
}
