package base

type ActionEnemy interface {
	Action

	// ActionEnemyCastable
	Castable(target *Unit) bool

	// user implemented
	Cast(target *Unit) *CastEnemy
}
