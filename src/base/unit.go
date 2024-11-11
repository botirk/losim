package base

import (
	"errors"
	"fmt"
	"losim/src/utils"
)

type Unit struct {
	name string
	Sim  *Sim

	Level uint

	settings UnitSettings

	health    float64
	maxHealth float64
	dead      bool

	mana    float64
	maxMana float64

	armor float64
	mr    float64

	baseAd    float64
	bonusAd   float64
	lifesteal float64

	baseAs  float64
	bonusAs float64
	asCap   float64

	OnFlatDamageReduction    utils.EventContainer[*DamageEvent]
	OnPercentDamageReduction utils.EventContainer[*DamageEvent]
	OnFinalDamageReduction   utils.EventContainer[*DamageEvent]
	OnTakeDamage             utils.EventContainer[DamageEvent]

	currentCast Cast
	attack      ActionEnemy
}

func InitUnit(u *Unit, name string, sim *Sim) *Unit {
	u.name = name
	u.Sim = sim
	u.Level = 1
	u.settings = UnitSettings{attackAnimation: 0.25}

	u.dead = false
	u.health = 100
	u.maxHealth = 100

	u.baseAd = 1
	u.baseAs = 0.5

	u.OnTakeDamage = NewDamageEventContainer()
	u.OnFlatDamageReduction = NewCalcDamageEventContainer()
	u.OnPercentDamageReduction = NewCalcDamageEventContainer()
	u.OnFinalDamageReduction = NewCalcDamageEventContainer()

	u.OnPercentDamageReduction.MustAdd(func(proc *DamageEvent) {
		proc.Value = u.CalcArmorDamageReduction(*proc).Value
		proc.Value = u.CalcMrDamageReduction(*proc).Value
	})

	u.attack = NewAttack(u)

	sim.Units = append(sim.Units, u)
	if sim.isLogEnabled {
		sim.Log("unit", fmt.Sprintf("%v unit added", name))
	}

	return u
}

func NewUnit(name string, sim *Sim) *Unit {
	return InitUnit(&Unit{}, name, sim)
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

func (u *Unit) CurrentCast() (Cast, error) {
	if u.currentCast != nil && u.currentCast.IsActive() {
		return u.currentCast, nil
	} else {
		return nil, errors.New("no current cast")
	}
}

func (u *Unit) Ad() float64 {
	return u.baseAd + u.bonusAd
}

func (u *Unit) As() float64 {
	return u.baseAs * (1 + u.bonusAs/100)
}

func (u *Unit) AsAnimation() float64 {
	return u.settings.attackAnimation
}
