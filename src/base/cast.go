package base

import "losim/src/utils"

type void int

type Cast struct {
	Owner *Action

	OnStartCast  utils.EventContainer[void]
	OnFinishCast utils.EventContainer[void]

	se       *SimulationEvent
	isActive bool
	proc     bool
}

func InitCast(c *Cast, owner *Action) *Cast {
	c.Owner = owner
	c.OnStartCast = utils.NewEventContainer[void]()
	c.OnFinishCast = utils.NewEventContainer[void]()
	return c
}

func NewCast(owner *Action) *Cast {
	return InitCast(&Cast{}, owner)
}

func (c *Cast) Cast() *Cast {
	if !c.Owner.Castable() {
		c.isActive = false
		c.proc = false
	} else {
		c.Owner.Owner.mana -= c.Owner.ManaCost()
		c.Owner.StartCooldown()
		castTime := c.Owner.CastTime()
		if castTime <= 0 {
			c.isActive = false
			c.proc = true
			c.OnStartCast.Proc(0)
			c.OnFinishCast.Proc(0)
		} else {
			c.isActive = true
			c.se = c.Owner.Owner.Sim.Insert(castTime)
			c.Owner.Owner.currentCast = c
			c.OnStartCast.Proc(0)
			c.se.OnProc.MustAdd(func(proc bool) {
				c.isActive = false
				c.proc = proc
				if proc {
					c.OnFinishCast.Proc(0)
				} else if c.Owner.IsCooldownFinishedOnInterrupt {
					c.Owner.FinishCooldown()
				}
			})
		}
	}
	return c
}

func (c *Cast) Wait() bool {
	if c.IsActive() {
		return c.se.Wait()
	} else {
		return c.proc
	}
}

func (c *Cast) IsActive() bool {
	return c.isActive
}

func (c *Cast) MustAdd(toAdd func(proc bool)) {
	if c.IsActive() {
		c.se.OnProc.MustAdd(toAdd)
	} else {
		toAdd(c.proc)
	}
}
