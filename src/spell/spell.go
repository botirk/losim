package spell

type Spell struct{
	name string
}

func (s *Spell) Name() string {
	return s.name
}