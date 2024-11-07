package base

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
