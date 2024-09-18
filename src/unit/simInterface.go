package unit

type SimInterface interface {
	Actors() []*Unit
	Log(system string, message string)
	AddActor(*Unit)
}
