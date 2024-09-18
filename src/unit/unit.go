package unit

import "losim/src/utils"

func NewUnit(name string, sim SimInterface) *Unit {
	u := Unit{
		name:         name,
		sim:          sim,
		OnTakeDamage: NewDamageEventContainer(),
	}
	sim.AddActor(&u)
	return &u
}

func NewDefaultUnit(sim SimInterface) *Unit {
	return NewUnit("Default unit", sim)
}

type Unit struct {
	name string
	sim  SimInterface

	health    float64
	maxHealth float64
	dead      bool

	OnTakeDamage utils.EventContainer[DamageEvent]
}

func (u *Unit) Name() string {
	return u.name
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

func (u *Unit) SetHealth(h float64) {
	u.health = h
}