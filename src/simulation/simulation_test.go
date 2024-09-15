package simulation

import (
	"testing"
)

func TestTime(t *testing.T) {
	sim := NewSimulation()

	if sim.Time() != 0 {
		t.Fatal(sim.Time())
	}
}
