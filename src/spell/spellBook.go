package spell

import (
	"losim/src/interfaces"
)

type SpellBook[T interfaces.Actor] struct {
	owner       T
	attackSpell interfaces.TargetSpell[T]
}

func NewSpellBook[T interfaces.Actor]() *SpellBook[T] {
	return &SpellBook[T]{}
}

func (sb *SpellBook[T]) Owner() T {
	return sb.owner
}

func (sb *SpellBook[T]) SetOwner(o T) {
	sb.owner = o
}

func (sb *SpellBook[T]) AttackSpell() interfaces.TargetSpell[T] {
	return sb.attackSpell
}
