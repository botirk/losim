package utils
type eventProc[T any] func(proc T)

type remove func()

type EventContainer[T any] struct {
	current uint
	events  map[uint]eventProc[T]
}

const maxUINT = ^uint(0)

func NewEventContainer[T any]() EventContainer[T] {
	return EventContainer[T]{
		current: 0,
		events:  make(map[uint]eventProc[T]),
	}
}

func (e *EventContainer[T]) MustAdd(proc eventProc[T]) remove {
	savedCurrent := e.current
	_, exist := e.events[e.current]
	if exist {
		panic("Overflow of Event(uint array overflowed)")
	}
	e.events[e.current] = proc
	if e.current == maxUINT {
		e.current = 0
	} else {
		e.current += 1
	}

	removed := false
	return func() {
		if !removed {
			delete(e.events, savedCurrent)
			removed = true
		}
	}
}

func (e *EventContainer[T]) Proc(value T) {
	for _, v := range e.events {
		v(value)
	}
}
