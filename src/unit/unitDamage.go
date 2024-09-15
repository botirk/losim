package unit

import (
	"losim/src/utils"
	"math"
)

type DamageType int

const (
	TRUED     DamageType = 0
	PHYSICALD DamageType = 1
	MAGICALD  DamageType = 2
)

type DamageEvent struct {
	src    Unit
	value  float64
	dtype  DamageType
	isCrit bool
}

func NewDamageEventContainer() utils.EventContainer[DamageEvent] {
	return utils.NewEventContainer[DamageEvent]()
}

func (u *Unit) TakeDamage(de DamageEvent) DamageEvent {
	// prevent beating dead
	if u.dead {
		de.value = 0
		return de
	}
	// fix
	de.value = math.Max(0, math.Min(u.health, de.value))
	// reduce health
	u.health -= de.value
	// call callbacks
	u.OnTakeDamage.Proc(de)
	// death check
	if u.health == 0 {
		u.dead = true
	}

	return de
}
