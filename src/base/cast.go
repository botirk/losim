package base

type Cast interface {
	// CastTiming
	Owner() Action
	IsActive() bool
	IsResolved() bool
	MustAdd(func(proc bool))
	Wait() bool
}
