package base

type Cast[T any] struct {
	Owner  *Action[T]
	se     *SimulationEvent
	state  bool
	target T
}

func InitCast[T any](c *Cast[T], owner *Action[T], target T) *Cast[T] {
	c.Owner = owner
	c.target = target
	if !owner.Castable(target) {
		c.state = false
	} else {
		c.Owner.Owner.mana -= c.Owner.ManaCost()
		if c.Owner.CastTime() <= 0 {
			c.Owner.StartCooldown()
			// to-do Procs
			c.state = true
		} else {
			// not instant cast
		}
	}
	return c
}

func NewCast[T any](owner *Action[T], target T) *Cast[T] {
	return InitCast(&Cast[T]{}, owner, target)
}

func (c *Cast[T]) Wait() bool {
	return c.state
}

func (c *Cast[T]) Target() T {
	return c.target
}
