package base

type ActionCooldown struct {
	action   Action
	cooldown *SimulationEvent
}

func InitActionCooldown(a *ActionCooldown, action Action) {
	a.action = action
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
	ct := a.action.CooldownTime()
	if ct > 0 && !a.IsCooldown() {
		a.cooldown = a.action.Owner().Sim.Insert(ct)
		return true
	}
	return false
}
