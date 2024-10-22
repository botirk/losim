package base

import "math"

type Action struct {
	Name  string
	Owner *Unit

	MinLevel                      uint
	MaxLevel                      uint
	IsCancelableByUser            bool
	IsCooldownFinishedOnInterrupt bool
	IsUltimate                    bool

	level uint

	CastTime     func() uint
	CooldownTime func() uint
	ManaCost     func() float64

	Castable func() bool

	cooldown *SimulationEvent

	// zero to ~500
	AbilityHaste uint
}

func InitAction(a *Action, owner *Unit, name string) *Action {
	a.Owner = owner
	a.Name = name
	a.CastTime = func() uint { return 0 }
	a.CooldownTime = func() uint { return 0 }
	a.ManaCost = func() float64 { return 0 }
	a.Castable = func() bool {
		return a.Level() >= a.MinLevel && !a.IsCooldown() && !a.Owner.Dead()
	}
	return a
}

func NewDefaultAction(owner *Unit) *Action {
	return InitAction(&Action{}, owner, defaultName)
}

func (a *Action) Level() uint {
	return a.level
}

func (a *Action) LevelUp() bool {
	if a.level >= a.MaxLevel {
		return false
	} else if a.IsUltimate {
		if a.Owner.Level < 6 {
			return false
		} else if a.Owner.Level < 11 && a.level >= 1 {
			return false
		} else if a.Owner.Level < 16 && a.level >= 2 {
			return false
		}
	} else if a.level >= uint(math.Ceil(float64(a.Owner.Level)/2)) {
		return false
	}
	a.level += 1
	return true
}

func (a *Action) IsCooldown() bool {
	return a.cooldown != nil && !a.cooldown.IsComplete() && a.cooldown.RemainingTime() > 0
}

func (a *Action) WaitCooldown() {
	if a.cooldown != nil {
		a.cooldown.Wait()
	}
}

func (a *Action) RemainingCooldown() uint {
	if a.IsCooldown() {
		return a.cooldown.RemainingTime()
	}
	return 0
}

func (a *Action) SetRemainingCooldown(rc uint) {
	a.cooldown.SetRemainingTime(rc)
}

func (a *Action) FinishCooldown() {
	a.cooldown.Finish(false)
}

func (a *Action) StartCooldown() bool {
	ct := a.CooldownTime()
	if ct > 0 && !a.IsCooldown() {
		a.cooldown = a.Owner.Sim.Insert(ct)
		return true
	}
	return false
}

func (a *Action) AbilityHasteModifier() float64 {
	return float64(100) / float64(100+a.AbilityHaste)
}

func (a *Action) Cast() *Cast {
	return NewCast(a).Cast()
}
