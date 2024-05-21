package actions

import (
	"net/http"

	"github.com/abc401/digital-logic-simulator/api/helpers"
	"github.com/abc401/digital-logic-simulator/api/projectstate"
	"github.com/gin-gonic/gin"
)

type SelectDeselectParams struct {
	CircuitID projectstate.IDType `json:"circuitID"`
}

func SelectCircuitDo(ctx *gin.Context) {
	var params SelectDeselectParams
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = projectstate.GetProject()
	var currentScene = project.GetCurrentScene()

	if !currentScene.HasObject(params.CircuitID) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "No circuit with provided id",
			"id":    params.CircuitID,
		})
	}

	var circuit = currentScene.GetCircuit(params.CircuitID)

	for _, wire := range circuit.AttachedWires {
		if (wire.FromCircuit == circuit.ID && project.SelectedCircuits[wire.ToCircuit]) || (wire.ToCircuit == circuit.ID && project.SelectedCircuits[wire.FromCircuit]) {
			project.SelectedWires[wire.ID] = true
		}
	}

	project.SelectedCircuits[circuit.ID] = true

	ctx.JSON(http.StatusOK, gin.H{
		"selected-circuits": project.SelectedCircuits,
		"selected-wires":    project.SelectedWires,
	})
}
func DeselectCircuitDo(ctx *gin.Context) {
	var params SelectDeselectParams
	if !helpers.BindParams(&params, ctx) {
		return
	}
	var project = projectstate.GetProject()
	var currentScene = project.GetCurrentScene()

	if !project.GetCurrentScene().HasObject(params.CircuitID) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "No circuit with provided id",
			"id":    params.CircuitID,
		})
	}

	var circuit = currentScene.GetCircuit(params.CircuitID)

	for _, wire := range circuit.AttachedWires {
		delete(project.SelectedWires, wire.ID)
	}

	delete(project.SelectedCircuits, circuit.ID)

	helpers.PrintCurrentScene(project)
	ctx.JSON(http.StatusOK, gin.H{
		"selected-circuits": project.SelectedCircuits,
		"selected-wires":    project.SelectedWires,
	})

}

func DeselectAllDo(ctx *gin.Context) {
	var project = projectstate.GetProject()

	project.DeselectAll()

	ctx.JSON(http.StatusOK, gin.H{})
}

func DeselectAllUndo(ctx *gin.Context) {
	type Params struct {
		SelectedWires    []projectstate.IDType `json:"selectedWireIDs"`
		SelectedCircuits []projectstate.IDType `json:"selectedCircuitIDs"`
	}
	var params Params

	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = projectstate.GetProject()
	var currentScene = project.GetCurrentScene()

	for _, id := range params.SelectedWires {
		if !currentScene.HasWire(id) {
			ctx.JSON(http.StatusNotFound, gin.H{
				"error": "no wire with specified id",
				"id":    id,
			})
			return
		}
	}

	for _, id := range params.SelectedCircuits {
		if !currentScene.HasCircuit(id) {
			ctx.JSON(http.StatusNotFound, gin.H{
				"error": "no circuit with specified id",
				"id":    id,
			})
			return
		}
	}

	for _, id := range params.SelectedWires {
		project.SelectedWires[id] = true
	}
	for _, id := range params.SelectedCircuits {
		project.SelectedCircuits[id] = true
	}

	ctx.JSON(http.StatusOK, gin.H{})
}
