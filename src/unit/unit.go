package unit

import "losim/src/utils"

func NewUnit(name string) *Unit {
	u := Unit{
		name:                     name,
		Sim:                      nil,
		OnTakeDamage:             NewDamageEventContainer(),
		OnFlatDamageReduction:    NewCalcDamageEventContainer(),
		OnPercentDamageReduction: NewCalcDamageEventContainer(),
		OnFinalDamageReduction:   NewCalcDamageEventContainer(),
	}
	return &u
}

func NewUnitAddToSim(name string, sim SimInterface) *Unit {
	result := NewUnit(name)
	result.Sim = sim
	sim.AddActor(result)
	return result
}

const defaultName = "Default Unit"

func NewDefaultUnit() *Unit {
	return NewUnit(defaultName)
}

func NewDefaultUnitAddToSim(sim SimInterface) *Unit {
	return NewUnitAddToSim(defaultName, sim)
}

type Unit struct {
	name string
	Sim  SimInterface

	health    float64
	maxHealth float64
	dead      bool

	OnFlatDamageReduction    utils.EventContainer[*DamageEvent]
	OnPercentDamageReduction utils.EventContainer[*DamageEvent]
	OnFinalDamageReduction   utils.EventContainer[*DamageEvent]
	OnTakeDamage             utils.EventContainer[DamageEvent]
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
