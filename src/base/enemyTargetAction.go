package base

type EnemyTargetAction struct {
	Action[*Unit]
}

func InitEnemyTargetAction(eta *EnemyTargetAction, owner *Unit, name string) *EnemyTargetAction {
	InitAction(&eta.Action, owner, name)
	oldCastable := eta.Castable
	eta.Castable = func(u *Unit) bool { return oldCastable(u) && u != eta.Owner }
	return eta
}

func NewDefaultEnemyTargetAction(owner *Unit) *EnemyTargetAction {
	return InitEnemyTargetAction(&EnemyTargetAction{}, owner, defaultName)
}
