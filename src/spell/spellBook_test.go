package spell

import (
	"losim/src/interfaces"
	"testing"
)

func SpellBookTest(t *testing.T) {
	sb := NewSpellBook[interfaces.Actor]()

	spell := sb.AttackSpell()

	if spell != nil {
		t.Fatal(spell)
	}

	if sb.Owner() != nil {
		t.Fatal(sb.Owner())
	}
}
