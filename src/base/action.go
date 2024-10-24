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

type Cast interface {
	// CastTiming
	Owner() Action
	IsActive() bool
	IsResolved() bool
	MustAdd(func(proc bool))
	Wait() bool
}

type CastTiming struct {
	owner    Cast
	se       *SimulationEvent
	isActive bool
	proc     bool
}

func InitCastTiming(c *CastTiming, owner Cast) {
	c.owner = owner
	c.isActive = true
}

func (c *CastTiming) IsActive() bool {
	return c.isActive
}

func (c *CastTiming) IsResolved() bool {
	return !c.isActive
}

func (c *CastTiming) Wait() bool {
	if c.IsActive() {
		return c.se.Wait()
	} else {
		return c.proc
	}
}

func (c *CastTiming) MustAdd(toAdd func(proc bool)) {
	if c.IsActive() {
		c.se.OnProc.MustAdd(toAdd)
	} else {
		toAdd(c.proc)
	}
}

func (c *CastTiming) Owner() Action {
	return c.owner.Owner()
}

type ActionLevel struct {
	Owner Action
	level uint
}

func (a *ActionLevel) Level() uint {
	return a.level
}

func (a *ActionLevel) LevelUp() bool {
	unitLevel := a.Owner.Owner().Level
	if a.level >= a.Owner.MaxLevel() {
		return false
	} else if a.Owner.IsUltimate() {
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
	Owner    Action
	cooldown *SimulationEvent
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
	ct := a.Owner.CooldownTime()
	if ct > 0 && !a.IsCooldown() {
		a.cooldown = a.Owner.Owner().Sim.Insert(ct)
		return true
	}
	return false
}
