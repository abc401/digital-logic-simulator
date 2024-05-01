package internal

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

type Circuit struct {
	Type  string
	Props CircuitProps

	CircuitSceneData
}

type CircuitSceneData struct {
	ID  IDType
	Pos struct {
		x float64
		y float64
	}
}

type Scene struct {
	ID        IDType
	Name      string
	ICInputs  NullableID
	ICOutputs NullableID
	Circuits  map[IDType]Circuit
}

func NewSceneNoIO() Scene {
	return Scene{
		ID:        DEFAULT_SCENE_ID,
		Name:      DEFAULT_SCENE_NAME,
		ICInputs:  NullableID{},
		ICOutputs: NullableID{},
		Circuits:  map[IDType]Circuit{},
	}
}

type Project struct {
	ID   IDType
	Name string

	CurrentScene IDType
	Scenes       map[IDType]Scene
}

var Projects = []Project{}
var currentProjectID = 0

const DEFAULT_SCENE_NAME = "Main"
const DEFAULT_SCENE_ID = IDType(0)

func NewProject(name string) Project {
	currentProjectID += 1
	return Project{
		ID:   IDType(currentProjectID),
		Name: name,
		Scenes: map[IDType]Scene{
			DEFAULT_SCENE_ID: {
				ID:        DEFAULT_SCENE_ID,
				Name:      DEFAULT_SCENE_NAME,
				ICInputs:  NullableID{},
				ICOutputs: NullableID{},
				Circuits:  map[IDType]Circuit{},
			},
		},
	}
}
