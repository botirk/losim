package base

import "math"

type ActionLevel struct {
	action Action
	level  uint
}

func InitActionLevel(a *ActionLevel, action Action) {
	a.action = action
}

func (a *ActionLevel) Level() uint {
	return a.level
}

func (a *ActionLevel) LevelUp() bool {
	unitLevel := a.action.Owner().Level
	if a.level >= a.action.MaxLevel() {
		return false
	} else if a.action.IsUltimate() {
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
