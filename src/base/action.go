package base

import "math"

type Void int

type Action[T any] struct {
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

	Castable func(T) bool

	ManaCost func() float64

	cooldown *SimulationEvent

	// zero to ~1000
	AbilityHaste uint
}

func InitAction[T any](a *Action[T], owner *Unit, name string) *Action[T] {
	a.Owner = owner
	a.Name = name
	a.CastTime = func() uint { return 0 }
	a.CooldownTime = func() uint { return 0 }
	a.ManaCost = func() float64 { return 0 }
	a.Castable = func(t T) bool {
		return a.Level() >= a.MinLevel && !a.IsCooldown() && !a.Owner.Dead()
	}
	return a
}

func NewDefaultAction(owner *Unit) *Action[Void] {
	return InitAction(&Action[Void]{}, owner, defaultName)
}

func (a *Action[T]) Level() uint {
	return a.level
}

func (a *Action[T]) LevelUp() bool {
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

func (a *Action[T]) IsCooldown() bool {
	return a.cooldown != nil && !a.cooldown.IsComplete() && a.cooldown.RemainingTime() > 0
}

func (a *Action[T]) WaitCooldown() {
	if a.cooldown != nil {
		a.cooldown.Wait()
	}
}

func (a *Action[T]) RemainingCooldown() uint {
	if a.IsCooldown() {
		return a.cooldown.RemainingTime()
	}
	return 0
}

func (a *Action[T]) SetRemainingCooldown(rc uint) {
	a.cooldown.SetRemainingTime(rc)
}

func (a *Action[T]) FinishCooldown() {
	a.cooldown.Finish(false)
}

func (a *Action[T]) StartCooldown() {
	if !a.IsCooldown() {
		a.cooldown = a.Owner.Sim.Insert(a.CooldownTime())
	}
}

func (a *Action[T]) AbilityHasteModifier() float64 {
	return float64(100) / float64(100+a.AbilityHaste)
}

func (a *Action[T]) Cast(target T) *Cast[T] {
	return NewCast[T](a, target)
}
