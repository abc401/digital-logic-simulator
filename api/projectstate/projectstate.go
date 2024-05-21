package projectstate

import (
	"errors"

	"github.com/abc401/digital-logic-simulator/math"
)

const DEFAULT_SCENE_NAME = "Main"
const DEFAULT_SCENE_ID = IDType(0)

var project = ProjectType{
	Scenes: []Scene{
		{
			ID:        DEFAULT_SCENE_ID,
			Name:      DEFAULT_SCENE_NAME,
			ICInputs:  NullableID{},
			ICOutputs: NullableID{},
			Circuits:  map[IDType]*Circuit{},
			Wires:     map[IDType]*Wire{},
		},
	},
	CurrentScene:     DEFAULT_SCENE_ID,
	SelectedCircuits: map[IDType]bool{},
	View:             math.NewViewManager(),
}

func (project *ProjectType) GetCurrentScene() *Scene {
	return &project.Scenes[project.CurrentScene]
}

func GetProject() *ProjectType {
	return &project
}

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

var DefaultCircuits = map[string]Circuit{
	"and": {
		CircuitType: "and",

		NConsumerPins: 2,
		NProducerPins: 1,
		Props: CircuitProps{
			"label":  "And",
			"Inputs": 2,
		},
	},
	"or": {
		CircuitType: "or",

		NConsumerPins: 2,
		NProducerPins: 1,
		Props: CircuitProps{
			"label":  "Or",
			"Inputs": 2,
		},
	},
	"not": {
		CircuitType: "not",

		NConsumerPins: 1,
		NProducerPins: 1,
		Props: CircuitProps{
			"label": "Not",
		},
	},
	"nand": {
		CircuitType: "nand",

		NConsumerPins: 2,
		NProducerPins: 1,
		Props: CircuitProps{
			"label":  "Nand",
			"Inputs": 2,
		},
	},
	"nor": {
		CircuitType: "nor",

		NConsumerPins: 2,
		NProducerPins: 1,
		Props: CircuitProps{
			"label":  "Nor",
			"Inputs": 2,
		},
	},
	"xor": {
		CircuitType: "xor",

		NConsumerPins: 2,
		NProducerPins: 1,
		Props: CircuitProps{
			"label":  "Xor",
			"Inputs": 2,
		},
	},
	"xnor": {
		CircuitType: "xnor",

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
	CircuitType   string
	PosWrl        math.Vec2
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
	Circuits  map[IDType]*Circuit
	Wires     map[IDType]*Wire
}

func (scene *Scene) HasObject(id IDType) bool {
	return scene.HasCircuit(id) || scene.HasWire(id)
}

func (scene *Scene) HasCircuit(id IDType) bool {
	_, circuitExists := scene.Circuits[id]
	return circuitExists
}

func (scene *Scene) HasWire(id IDType) bool {
	_, wireExists := scene.Wires[id]
	return wireExists
}

func (scene *Scene) GetCircuit(id IDType) *Circuit {
	circuit, ok := scene.Circuits[id]
	if ok {
		return circuit
	}
	return nil
}

func (scene *Scene) AddCircuit(id IDType, circuit Circuit) error {
	if scene.HasObject(id) {
		return errors.New("id is already taken")
	}

	scene.Circuits[id] = &circuit

	return nil
}

func (scene *Scene) DeleteCircuit(id IDType) error {
	if !scene.HasCircuit(id) {
		return errors.New("circuit does not exist")
	}

	delete(scene.Circuits, id)

	return nil
}

type ProjectType struct {
	Scenes           []Scene
	CurrentScene     IDType
	SelectedCircuits map[IDType]bool
	View             math.ViewManager
}
