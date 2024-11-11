package base

import "fmt"

type Attack struct {
	unit                *Unit
	SettingCastTime     func() uint
	SettingCooldownTime func() uint

	ActionCooldown
	ActionHaste
	ActionLevel
	ActionEnemyCastable
}

func InitAttack(attack *Attack, unit *Unit) *Attack {
	attack.unit = unit
	attack.SettingCastTime = func() uint { 
		owner := attack.Owner()
		return uint((1 / owner.As()) * owner.AsAnimation() * 1000) 
	}
	attack.SettingCooldownTime = func() uint { return uint((1 / attack.Owner().As()) * 1000) }

	InitActionHaste(&attack.ActionHaste, attack)
	InitActionLevel(&attack.ActionLevel, attack)
	InitActionCooldown(&attack.ActionCooldown, attack)
	InitActionEnemyCastable(&attack.ActionEnemyCastable, attack)

	return attack
}

func NewAttack(unit *Unit) *Attack {
	return InitAttack(&Attack{}, unit)
}

func (a *Attack) Cast(target *Unit) *CastEnemy {
	result, init := NewCastEnemy(a, target)
	result.OnStartCast.MustAdd(func(proc *Unit) {
		owner := a.Owner()
		if owner.Sim.isLogEnabled {
			owner.Sim.Log("attack", fmt.Sprintf("%v starts attack against %v", owner.Name(), proc.Name()))
		}
	})
	result.OnFinishCast.MustAdd(func(proc *Unit) {
		owner := a.Owner()
		if owner.Sim.isLogEnabled {
			owner.Sim.Log("attack", fmt.Sprintf("%v finishes attack against %v", owner.Name(), proc.Name()))
		}
	})

	init()

	return result
}

func (a *Attack) Owner() *Unit {
	return a.unit
}

func (a *Attack) CastTime() uint {
	return a.SettingCastTime()
}

func (a *Attack) CooldownTime() uint {
	return a.SettingCooldownTime()
}

func (a *Attack) IsCancelableByUser() bool {
	return true
}

func (a *Attack) IsCooldownFinishedOnInterrupt() bool {
	return true
}

func (a *Attack) IsUltimate() bool {
	return false
}

func (a *Attack) ManaCost() float64 {
	return 0
}

func (a *Attack) MaxLevel() uint {
	return 0
}

func (a *Attack) MinLevel() uint {
	return 0
}
