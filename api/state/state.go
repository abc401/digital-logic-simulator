package state

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"
	"unicode"

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

func NewProject() ProjectType {
	return ProjectType{
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
		ID:    id,
		Valid: true,
	}
}

type NullableID struct {
	ID    IDType
	Valid bool
}

func (id *NullableID) Some(validID IDType) *NullableID {
	id.ID = validID
	id.Valid = true
	return id
}

func (id *NullableID) None() *NullableID {
	id.Valid = false
	return id
}

func (id *NullableID) Unwrap() (IDType, bool) {
	return id.ID, id.Valid
}

type CircuitProps map[string]interface{}

var DefaultCircuits = map[string]Circuit{
	"Input": {
		CircuitType: "Input",

		NInputPins:  0,
		NOutputPins: 1,
		Props: CircuitProps{
			"label": "Input",
			"value": false,
		},
	},
	"And": {
		CircuitType: "And",

		NInputPins:  2,
		NOutputPins: 1,
		Props: CircuitProps{
			"label":  "And",
			"inputs": 2,
		},
	},
	"Or": {
		CircuitType: "Or",

		NInputPins:  2,
		NOutputPins: 1,
		Props: CircuitProps{
			"label":  "Or",
			"inputs": 2,
		},
	},
	"Not": {
		CircuitType: "Not",

		NInputPins:  1,
		NOutputPins: 1,
		Props: CircuitProps{
			"label": "Not",
		},
	},
	"Nand": {
		CircuitType: "Nand",

		NInputPins:  2,
		NOutputPins: 1,
		Props: CircuitProps{
			"label":  "Nand",
			"inputs": 2,
		},
	},
	"Nor": {
		CircuitType: "Nor",

		NInputPins:  2,
		NOutputPins: 1,
		Props: CircuitProps{
			"label":  "Nor",
			"inputs": 2,
		},
	},
	"Xor": {
		CircuitType: "Xor",

		NInputPins:  2,
		NOutputPins: 1,
		Props: CircuitProps{
			"label":  "Xor",
			"inputs": 2,
		},
	},
	"Xnor": {
		CircuitType: "Xnor",

		NInputPins:  2,
		NOutputPins: 1,
		Props: CircuitProps{
			"label":  "Xnor",
			"inputs": 2,
		},
	},
}

type Circuit struct {
	ID          IDType
	CircuitType string
	PosWrl      math.Vec2
	NInputPins  uint64
	NOutputPins uint64
	InputWires  []*Wire
	OutputWires []*Wire
	Props       CircuitProps
}

func NewICInputs() *Circuit {
	return &Circuit{
		ID:          CUSTOM_CIRCUIT_INPUTS_ID,
		CircuitType: "customcircuitinputs",
		PosWrl:      math.NewVec2(90, 220),
		NInputPins:  0,
		NOutputPins: 1,
		InputWires:  []*Wire{},
		OutputWires: make([]*Wire, 1),
		Props: CircuitProps{
			"label": "CustomCircuitInputs",
		},
	}
}

func NewICOutputs() *Circuit {
	return &Circuit{
		ID:          CUSTOM_CIRCUIT_OUTPUTS_ID,
		CircuitType: "customcircuitoutputs",
		PosWrl:      math.NewVec2(90, 220),
		NInputPins:  1,
		NOutputPins: 0,
		InputWires:  make([]*Wire, 1),
		OutputWires: []*Wire{},
		Props: CircuitProps{
			"label": "CustomCircuitOutputs",
		},
	}
}

func SetCircuitLabel(circuit *Circuit, value string) bool {
	if value == "" {
		return false
	}
	var isWhiteSpace = true
	for _, char := range value {
		if !unicode.IsSpace(char) {
			isWhiteSpace = false
		}
	}
	if isWhiteSpace {
		return false
	}

	circuit.Props["label"] = value
	return true
}

func SetInputValue(circuit *Circuit, value string) bool {

	var valueBool, err = strconv.ParseBool(strings.Trim(value, " \t"))
	if err != nil {
		return false
	}

	if circuit.CircuitType != "input" {

		str, err := json.MarshalIndent(circuit, "", "  ")
		if err != nil {
			log.Fatalf(err.Error())
		}
		fmt.Printf("\n\n[Error] Tried to set 'value' prop of: %s\n\n", str)

		str, err = json.MarshalIndent(GetProject(), "", "  ")
		if err != nil {
			log.Fatalf(err.Error())
		}
		fmt.Printf("\n\n[Info] Project: %s\n\n", str)
		// fmt.Printf("\n\n[Error] Tried to set 'value' prop of: %s\n\n", helpers.SPrettyPrint(circuit))
		// fmt.Printf("\n\n[Info] Project: %s\n\n", helpers.SPrettyPrint(GetProject()))
		// os.Exit(1)
	}
	circuit.Props["value"] = valueBool
	return true
}

func SetCircuitInputs(circuit *Circuit, value string) bool {
	if _, ok := circuit.Props["inputs"]; !ok {
		str, err := json.MarshalIndent(value, "", "  ")
		if err != nil {
			log.Fatalf(err.Error())
		}
		fmt.Printf("\n\n[Error] Tried to set 'inputs' prop of circuit to: %s\n\n", str)

		str, err = json.MarshalIndent(circuit, "", "  ")
		if err != nil {
			log.Fatalf(err.Error())
		}
		fmt.Printf("Circuit: %s", str)

		str, err = json.MarshalIndent(GetProject(), "", "  ")
		if err != nil {
			log.Fatalf(err.Error())
		}
		fmt.Printf("\n\n[Info] Project: %s\n\n", str)
	}

	var nConsumerPins, err = strconv.ParseInt(value, 10, 64)
	if err != nil || nConsumerPins < 0 {
		str, err := json.MarshalIndent(value, "", "	")
		if err != nil {
			log.Fatalf(err.Error())
		}
		fmt.Printf("[Info] Error parsing int from string: %s", str)
		return false
	}

	if len(circuit.InputWires) == int(nConsumerPins) {
		fmt.Println("[Info] len(circuit.InputWires) == int(nConsumerPins)")
		return true
	}

	var nConnectedPins = uint64(0)

	for _, wire := range circuit.InputWires {
		if wire != nil {
			nConnectedPins++
		}
	}
	if nConnectedPins > uint64(nConsumerPins) {
		fmt.Println("[Info] nConnectedPins > uint64(nConsumerPins)")
		return false
	}

	var newPins = make([]*Wire, nConsumerPins)

	var pinIndex = uint64(0)
	for _, pin := range circuit.InputWires {
		if pin != nil {
			newPins[pinIndex] = pin
			pin.ToPin = pinIndex
			pinIndex++
		}

	}
	circuit.InputWires = newPins
	circuit.Props["inputs"] = nConsumerPins
	circuit.NInputPins = uint64(nConsumerPins)

	fmt.Printf("[Info] Successfully set value to %v", nConsumerPins)
	return true
}

type PropSetter func(*Circuit, string) bool

var commonPropSetters = map[string]PropSetter{
	"inputs": SetCircuitInputs,
}

var CircuitPropSetters = map[string]map[string]PropSetter{
	"*": {
		"label": SetCircuitLabel,
	},
	"input": {
		"value": SetInputValue,
	},
	"and":  commonPropSetters,
	"or":   commonPropSetters,
	"not":  commonPropSetters,
	"nand": commonPropSetters,
	"nor":  commonPropSetters,
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

func NewSceneWithIO(id IDType, name string) *Scene {
	return &Scene{
		ID:        id.ToNullable(),
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
