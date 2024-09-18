package unit

import (
	utils "losim/src/utils"
	"math"
)

type DamageType int

const (
	TRUED     DamageType = 0
	PHYSICALD DamageType = 1
	MAGICALD  DamageType = 2
)

type DamageEvent struct {
	Src    *Unit
	Value  float64
	Dtype  DamageType
	IsCrit bool
}

func NewDamageEventContainer() utils.EventContainer[DamageEvent] {
	return utils.NewEventContainer[DamageEvent]()
}

func (u *Unit) TakeDamage(de DamageEvent) DamageEvent {
	// prevent beating dead
	if u.dead {
		de.Value = 0
		return de
	}
	// fix
	de.Value = math.Max(0, math.Min(u.health, de.Value))
	// reduce health
	u.health -= de.Value
	// call callbacks
	u.OnTakeDamage.Proc(de)
	// death check
	if u.health == 0 {
		u.dead = true
	}

	return de
}
