package utils

import "testing"

func TestAddProcEvents(t *testing.T) {
	event := NewEventContainer[int]()

	procced := -1
	event.MustAdd(func(res int) {
		procced = res
	})

	value := 100
	event.Proc(value)

	if procced != 100 {
		t.Fatal(procced, value)
	}

	procced2 := -1
	event.MustAdd(func(res int) {
		procced2 = res
	})

	value = -100
	event.Proc(value)

	if procced != -100 && procced2 != -100 {
		t.Fatal(procced, procced2, value)
	}
}
