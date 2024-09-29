package base

import "math"

type Action struct {
	Owner Unit

	MinLevel                      uint
	MaxLevel                      uint
	IsCancelableByUser            bool
	IsCooldownFinishedOnInterrupt bool
	IsUltimate                    bool

	level uint

	CastTime     func() uint
	CooldownTime func() uint

	ManaCost func() float64

	cooldown SimulationEvent
}

func NewDefaultAction(owner Unit) *Action {
	a := Action{
		Owner: owner,

		CastTime:     func() uint { return 0 },
		CooldownTime: func() uint { return 0 },

		ManaCost: func() float64 { return 0 },
	}

	return &a
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
	return a.cooldown.isInitialized && a.cooldown.IsComplete()
}

func (a *Action) WaitCooldown() {
	if a.cooldown.isInitialized {
		a.cooldown.Wait()
	}
}

func (a *Action) RemainingCooldown() uint {
	if a.cooldown.isInitialized {
		return a.cooldown.RemainingTime()
	}
	return 0
}

func (a *Action) SetRemainingCooldown(rc uint) {
	a.cooldown.SetRemainingTime(rc)
}

func (a *Action) FinishCooldown() {

}
