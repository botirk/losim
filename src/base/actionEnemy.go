package base

type ActionEnemy interface {
	Action

	// ActionEnemyCastable
	Castable(target *Unit) bool

	// user implemented
	Cast(target *Unit) *CastEnemy
}

type ActionEnemyCastable struct {
	Action ActionEnemy
}

func InitActionEnemyCastable(a *ActionEnemyCastable, action ActionEnemy) {
	a.Action = action
}

func (a *ActionEnemyCastable) Castable(target *Unit) bool {
	owner := a.Action.Owner()
	_, err := owner.CurrentCast()

	return a.Action.Level() >= a.Action.MinLevel() && (err != nil || a.Action.CastTime() == 0) && !a.Action.IsCooldown() && !owner.Dead() && owner.mana >= a.Action.ManaCost()
}
