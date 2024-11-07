package base

type CastTiming struct {
	action    Action
	se       *SimulationEvent
	isActive bool
	proc     bool
}

func InitCastTiming(c *CastTiming, action Action) {
	c.action = action
	c.isActive = true
}

func (c *CastTiming) IsActive() bool {
	return c.isActive
}

func (c *CastTiming) IsResolved() bool {
	return !c.isActive
}

func (c *CastTiming) Wait() bool {
	if c.IsActive() {
		return c.se.Wait()
	} else {
		return c.proc
	}
}

func (c *CastTiming) MustAdd(toAdd func(proc bool)) {
	if c.IsActive() {
		c.se.OnProc.MustAdd(toAdd)
	} else {
		toAdd(c.proc)
	}
}

func (c *CastTiming) Owner() Action {
	return c.action
}
