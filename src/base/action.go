package base

import "math"

type Action interface {
	// ActionLevel
	Level() uint
	LevelUp() bool
	// ActionCooldown
	IsCooldown() bool
	SetRemainingCooldown(rc uint)
	RemainingCooldown() uint
	FinishCooldown()
	StartCooldown() bool
	WaitCooldown()
	// ActionHaste
	AbilityHaste() uint
	AbilityHasteModifier() float64
	SetAbilityHaste(ah uint)

	// user implemented
	Owner() *Unit
	MinLevel() uint
	MaxLevel() uint
	CastTime() uint
	CooldownTime() uint
	ManaCost() float64
	IsCancelableByUser() bool
	IsCooldownFinishedOnInterrupt() bool
	IsUltimate() bool
}

type ActionLevel struct {
	Action Action
	level uint
}

func InitActionLevel(a *ActionLevel, action Action) {
	a.Action = action
}

func (a *ActionLevel) Level() uint {
	return a.level
}

func (a *ActionLevel) LevelUp() bool {
	unitLevel := a.Action.Owner().Level
	if a.level >= a.Action.MaxLevel() {
		return false
	} else if a.Action.IsUltimate() {
		if unitLevel < 6 {
			return false
		} else if unitLevel < 11 && a.level >= 1 {
			return false
		} else if unitLevel < 16 && a.level >= 2 {
			return false
		}
	} else if a.level >= uint(math.Ceil(float64(unitLevel)/2)) {
		return false
	}
	a.level += 1
	return true
}

type ActionCooldown struct {
	Action    Action
	cooldown *SimulationEvent
}

func InitActionCooldown(a *ActionCooldown, action Action) {
	a.Action = action
}

func (a *ActionCooldown) IsCooldown() bool {
	return a.cooldown != nil && !a.cooldown.IsComplete() && a.cooldown.RemainingTime() > 0
}

func (a *ActionCooldown) WaitCooldown() {
	if a.cooldown != nil {
		a.cooldown.Wait()
	}
}

func (a *ActionCooldown) RemainingCooldown() uint {
	if a.IsCooldown() {
		return a.cooldown.RemainingTime()
	}
	return 0
}

func (a *ActionCooldown) SetRemainingCooldown(rc uint) {
	a.cooldown.SetRemainingTime(rc)
}

func (a *ActionCooldown) FinishCooldown() {
	a.cooldown.Finish(false)
}

func (a *ActionCooldown) StartCooldown() bool {
	ct := a.Action.CooldownTime()
	if ct > 0 && !a.IsCooldown() {
		a.cooldown = a.Action.Owner().Sim.Insert(ct)
		return true
	}
	return false
}

type ActionHaste struct {
	Action Action
	haste uint
}

func InitActionHaste(a *ActionHaste, action Action) {
	a.Action = action
}

func (ah *ActionHaste) AbilityHaste() uint {
	return ah.haste
}

func (ah *ActionHaste) AbilityHasteModifier() float64 {
	return 100 / (100 + float64(ah.haste))
}

func (ah *ActionHaste) SetAbilityHaste(ahIN uint) {
	ah.haste = ahIN
}
