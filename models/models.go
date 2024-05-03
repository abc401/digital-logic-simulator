package models

const DEFAULT_SCENE_NAME = "Main"
const DEFAULT_SCENE_ID = IDType(0)

type IDType uint64

func (id *IDType) ToNullable() NullableID {
	return NullableID{
		id:    *id,
		valid: true,
	}
}

type NullableID struct {
	id    IDType
	valid bool
}

func (id *NullableID) Some(validID IDType) *NullableID {
	id.id = validID
	id.valid = true
	return id
}

func (id *NullableID) None() *NullableID {
	id.valid = false
	return id
}

func (id *NullableID) Unwrap() (IDType, bool) {
	return id.id, id.valid
}

type CircuitProps map[string]interface{}
type Vec2 struct {
	X float64
	Y float64
}

var ValidCircuitTypes = []string{
	"and",
	"or",
	"not",
	"nand",
	"nor",
	"xor",
	"xnor",
}

type Circuit struct {
	ID    IDType
	Type  string
	Pos   Vec2
	Props CircuitProps
}

type Scene struct {
	ID        IDType
	Name      string
	ICInputs  NullableID
	ICOutputs NullableID
	Circuits  map[IDType]Circuit
}
