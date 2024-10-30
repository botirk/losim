package base

type Cast interface {
	// CastTiming
	Owner() Action
	IsActive() bool
	IsResolved() bool
	MustAdd(func(proc bool))
	Wait() bool
}

type CastTiming struct {
	owner    Action
	se       *SimulationEvent
	isActive bool
	proc     bool
}

func InitCastTiming(c *CastTiming, owner Action) {
	c.owner = owner
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
	return c.owner
}
