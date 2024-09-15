package unit

import (
	"losim/src/simulation"
	"losim/src/utils"
)

func NewUnit(sim simulation.Simulation) Unit {
	return Unit{
		OnTakeDamage: NewDamageEventContainer(),
	}
}

type Unit struct {
	health    float64
	maxHealth float64
	dead      bool

	OnTakeDamage utils.EventContainer[DamageEvent]
}

func (u *Unit) Health() float64 {
	return u.health
}

func (u *Unit) MaxHealth() float64 {
	return u.maxHealth
}

func (u *Unit) Dead() bool {
	return u.dead
}
