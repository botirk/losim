package base

import "losim/src/utils"

type CastEnemy struct {
	CastTiming

	Action  ActionEnemy
	Target *Unit

	OnStartCast  utils.EventContainer[*Unit]
	OnFinishCast utils.EventContainer[*Unit]
}

type CastFunc func()

func InitCastEnemy(c *CastEnemy, action ActionEnemy, target *Unit) (*CastEnemy, CastFunc) {
	InitCastTiming(&c.CastTiming, action)
	ownerUnit := action.Owner()
	c.Action = action
	c.Target = target

	c.OnStartCast = utils.NewEventContainer[*Unit]()
	c.OnFinishCast = utils.NewEventContainer[*Unit]()

	return c, func() {
		if !c.Action.Castable(c.Target) {
			c.isActive = false
			c.proc = false
		} else {
			ownerUnit.mana -= c.Action.ManaCost()
			c.Action.StartCooldown()
			castTime := c.Action.CastTime()
			if castTime <= 0 {
				c.isActive = false
				c.proc = true
				c.OnStartCast.Proc(c.Target)
				c.OnFinishCast.Proc(c.Target)
			} else {
				c.isActive = true
				c.se = ownerUnit.Sim.Insert(castTime)
				ownerUnit.currentCast = c
				c.OnStartCast.Proc(c.Target)
				c.se.OnProc.MustAdd(func(proc bool) {
					c.isActive = false
					c.proc = proc
					if proc {
						c.OnFinishCast.Proc(c.Target)
					} else if c.Action.IsCooldownFinishedOnInterrupt() {
						c.Action.FinishCooldown()
					}
				})
			}
		}
	}
}

func NewCastEnemy(action ActionEnemy, target *Unit) (*CastEnemy, CastFunc) {
	return InitCastEnemy(&CastEnemy{}, action, target)
}
