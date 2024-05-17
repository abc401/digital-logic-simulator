package models

import (
	"database/sql"
)

const DEFAULT_SCENE_NAME = "Main"
const DEFAULT_SCENE_ID = IDType(0)

type IDType uint64

func (id *IDType) ToNullable() NullableID {
	return NullableID{
		id:    *id,
		valid: true,
	}
}

type Article struct {
	// gorm.Model
	ID           uint   `gorm:"primarykey"`
	LinkTitle    string `gorm:"index"`
	DisplayTitle string
	Content      string
	Previous     sql.NullString
	Next         sql.NullString
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

var DefaultCircuits = map[string]Circuit{
	"and": {
		Type: "and",

		NConsumerPins: 2,
		NProducerPins: 1,
		Props: CircuitProps{
			"label":  "And",
			"Inputs": 2,
		},
	},
	"or": {
		Type: "or",

		NConsumerPins: 2,
		NProducerPins: 1,
		Props: CircuitProps{
			"label":  "Or",
			"Inputs": 2,
		},
	},
	"not": {
		Type: "not",

		NConsumerPins: 1,
		NProducerPins: 1,
		Props: CircuitProps{
			"label": "Not",
		},
	},
	"nand": {
		Type: "nand",

		NConsumerPins: 2,
		NProducerPins: 1,
		Props: CircuitProps{
			"label":  "Nand",
			"Inputs": 2,
		},
	},
	"nor": {
		Type: "nor",

		NConsumerPins: 2,
		NProducerPins: 1,
		Props: CircuitProps{
			"label":  "Nor",
			"Inputs": 2,
		},
	},
	"xor": {
		Type: "xor",

		NConsumerPins: 2,
		NProducerPins: 1,
		Props: CircuitProps{
			"label":  "Xor",
			"Inputs": 2,
		},
	},
	"xnor": {
		Type: "xnor",

		NConsumerPins: 2,
		NProducerPins: 1,
		Props: CircuitProps{
			"label":  "Xnor",
			"Inputs": 2,
		},
	},
}

type Circuit struct {
	ID            IDType
	Type          string
	Pos           Vec2
	NConsumerPins uint64
	NProducerPins uint64
	Props         CircuitProps
}

type Wire struct {
	ID IDType

	FromCircuit IDType `json:"from-circuit"`
	FromPin     uint64 `json:"from-pin"`

	ToCircuit IDType `json:"to-circuit"`
	ToPin     uint64 `json:"to-pin"`
}

type Scene struct {
	ID        IDType
	Name      string
	ICInputs  NullableID
	ICOutputs NullableID
	Circuits  map[IDType]Circuit
}
