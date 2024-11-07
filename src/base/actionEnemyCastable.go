package base

type ActionEnemyCastable struct {
	action ActionEnemy
}

func InitActionEnemyCastable(a *ActionEnemyCastable, action ActionEnemy) {
	a.action = action
}

func (a *ActionEnemyCastable) Castable(target *Unit) bool {
	owner := a.action.Owner()
	_, err := owner.CurrentCast()

	return owner != target && a.action.Level() >= a.action.MinLevel() && (err != nil || a.action.CastTime() == 0) && !a.action.IsCooldown() && !owner.Dead() && owner.mana >= a.action.ManaCost()
}
