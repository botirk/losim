package unit

import (
	"fmt"
	utils "losim/src/utils"
	"math"
)

//go:generate stringer -type=TLSType
type DamageType int

const (
	TRUED     DamageType = 0
	PHYSICALD DamageType = 1
	MAGICALD  DamageType = 2
)

func (dt DamageType) toString() string {
	switch dt {
	case TRUED:
		return "true"
	case PHYSICALD:
		return "physical"
	case MAGICALD:
		return "magical"
	default:
		return "unknown"
	}
}

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
	// damage reduction
	de.Value = u.CalcDamageReduction(de).Value
	// fix
	de.Value = math.Max(0, math.Min(u.health, de.Value))
	// reduce health
	u.health -= de.Value
	// log
	if u.Sim != nil && u.Sim.IsLogEnabled() {
		u.Sim.Log("unitDamage", fmt.Sprintf("%v took %v %v damage from %v", u.Name(), de.Value, de.Dtype.toString(), de.Src.Name()))
	}
	// call callbacks
	u.OnTakeDamage.Proc(de)
	// death check
	if u.health == 0 {
		u.dead = true
	}

	return de
}

func NewCalcDamageEventContainer() utils.EventContainer[*DamageEvent] {
	return utils.NewEventContainer[*DamageEvent]()
}

func (u *Unit) CalcDamageReduction(de DamageEvent) DamageEvent {
	u.OnFlatDamageReduction.Proc(&de)
	u.OnPercentDamageReduction.Proc(&de)
	u.OnFinalDamageReduction.Proc(&de)
	return de
}

func (u *Unit) CalcArmorDamageReduction(de DamageEvent) DamageEvent {
	if de.Dtype == PHYSICALD {
		armor := u.ArmorRelativeTo(de.Src)
		de.Value = (1 - armor/(100+armor)) * de.Value
	}
	return de
}

func (u *Unit) CalcMrDamageReduction(de DamageEvent) DamageEvent {
	if de.Dtype == MAGICALD {
		mr := u.MRRelativeTo(de.Src)
		de.Value = (1 - mr/(100+mr)) * de.Value
	}
	return de
}
