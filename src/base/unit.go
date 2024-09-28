package base

import (
	"fmt"
	"losim/src/utils"
)

type Unit struct {
	name string
	Sim  *Sim

	Level uint

	health    float64
	maxHealth float64
	dead      bool

	armor float64
	mr    float64

	OnFlatDamageReduction    utils.EventContainer[*DamageEvent]
	OnPercentDamageReduction utils.EventContainer[*DamageEvent]
	OnFinalDamageReduction   utils.EventContainer[*DamageEvent]
	OnTakeDamage             utils.EventContainer[DamageEvent]
}

func NewUnit(name string, sim *Sim) *Unit {
	u := Unit{
		name: name,
		Sim:  sim,

		Level: 1,

		dead:      false,
		health:    100,
		maxHealth: 100,

		OnTakeDamage:             NewDamageEventContainer(),
		OnFlatDamageReduction:    NewCalcDamageEventContainer(),
		OnPercentDamageReduction: NewCalcDamageEventContainer(),
		OnFinalDamageReduction:   NewCalcDamageEventContainer(),
	}
	u.OnPercentDamageReduction.MustAdd(func(proc *DamageEvent) {
		proc.Value = u.CalcArmorDamageReduction(*proc).Value
		proc.Value = u.CalcMrDamageReduction(*proc).Value
	})

	sim.Units = append(sim.Units, &u)
	sim.Log("unit", fmt.Sprintf("%v unit added", name))

	return &u
}

const defaultName = "default"

func NewDefaultUnit(sim *Sim) *Unit {
	return NewUnit(defaultName, sim)
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

func (u *Unit) Armor() float64 {
	return u.armor
}

func (u *Unit) ArmorRelativeTo(au *Unit) float64 {
	return u.Armor()
}

func (u *Unit) MR() float64 {
	return u.mr
}

func (u *Unit) MRRelativeTo(au *Unit) float64 {
	return u.MR()
}

func (u *Unit) Dead() bool {
	return u.dead
}

func (u *Unit) SetHealth(h float64) {
	u.health = h
}
