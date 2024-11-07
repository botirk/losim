package base

type ActionHaste struct {
	action Action
	haste  uint
}

func InitActionHaste(a *ActionHaste, action Action) {
	a.action = action
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
