package projectstate

import (
	"errors"

	"github.com/abc401/digital-logic-simulator/math"
)

const DEFAULT_SCENE_NAME = "Main"
const DEFAULT_SCENE_ID = IDType(0)

var project = ProjectType{
	Scenes: map[IDType]*Scene{
		DEFAULT_SCENE_ID: {
			ID:        DEFAULT_SCENE_ID.ToNullable(),
			Name:      DEFAULT_SCENE_NAME,
			ICInputs:  NullableID{},
			ICOutputs: NullableID{},
			Circuits:  map[IDType]*Circuit{},
			Wires:     map[IDType]*Wire{},
		},
	},
	CurrentSceneID:   DEFAULT_SCENE_ID,
	SelectedCircuits: map[IDType]bool{},
	SelectedWires:    map[IDType]bool{},
	View:             math.NewViewManager(),
	ICs:              map[IDType]string{},
}

func (project *ProjectType) GetCurrentScene() *Scene {
	return project.Scenes[project.CurrentSceneID]
}

func GetProject() *ProjectType {
	return &project
}

type IDType uint64

func (id IDType) ToNullable() NullableID {
	return NullableID{
		id:    id,
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
	AttachedWires map[IDType]*Wire
	Props         CircuitProps
}

func NewICInputs() *Circuit {
	return &Circuit{
		ID:            CUSTOM_CIRCUIT_INPUTS_ID,
		CircuitType:   "customcircuitinputs",
		PosWrl:        math.NewVec2(90, 220),
		NConsumerPins: 0,
		NProducerPins: 1,
		AttachedWires: map[IDType]*Wire{},
		Props: CircuitProps{
			"label": "CustomCircuitInputs",
		},
	}
}

func NewICOutputs() *Circuit {
	return &Circuit{
		ID:            CUSTOM_CIRCUIT_OUTPUTS_ID,
		CircuitType:   "customcircuitoutputs",
		PosWrl:        math.NewVec2(90, 220),
		NConsumerPins: 1,
		NProducerPins: 0,
		AttachedWires: map[IDType]*Wire{},
		Props: CircuitProps{
			"label": "CustomCircuitOutputs",
		},
	}
}

type Wire struct {
	ID IDType

	FromCircuit IDType
	FromPin     uint64

	ToCircuit IDType
	ToPin     uint64
}

const CUSTOM_CIRCUIT_INPUTS_ID = IDType(0)
const CUSTOM_CIRCUIT_OUTPUTS_ID = IDType(1)

type Scene struct {
	ID        NullableID
	Name      string
	ICInputs  NullableID
	ICOutputs NullableID
	Circuits  map[IDType]*Circuit
	Wires     map[IDType]*Wire
}

func NewSceneWithIO(name string) *Scene {
	return &Scene{
		Name:      name,
		ICInputs:  CUSTOM_CIRCUIT_INPUTS_ID.ToNullable(),
		ICOutputs: CUSTOM_CIRCUIT_OUTPUTS_ID.ToNullable(),
		Circuits: map[IDType]*Circuit{
			CUSTOM_CIRCUIT_INPUTS_ID:  NewICInputs(),
			CUSTOM_CIRCUIT_OUTPUTS_ID: NewICOutputs(),
		},
		Wires: map[IDType]*Wire{},
	}
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
func (scene *Scene) GetWire(id IDType) *Wire {
	wire, ok := scene.Wires[id]
	if ok {
		return wire
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
	Scenes           map[IDType]*Scene
	CurrentSceneID   IDType
	SelectedCircuits map[IDType]bool
	SelectedWires    map[IDType]bool
	View             math.ViewManager
	ICs              map[IDType]string
}

func (project *ProjectType) DeselectAll() {
	project.SelectedCircuits = map[IDType]bool{}
	project.SelectedWires = map[IDType]bool{}
}
