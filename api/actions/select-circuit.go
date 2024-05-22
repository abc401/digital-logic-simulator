package actions

import (
	"net/http"

	"github.com/abc401/digital-logic-simulator/api/helpers"
	"github.com/abc401/digital-logic-simulator/api/projectstate"
	"github.com/gin-gonic/gin"
)

type SelectCircuitParams struct {
	CircuitID projectstate.IDType `json:"circuitID"`
}

func SelectCircuitDo(ctx *gin.Context) {
	var params SelectCircuitParams
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
func SelectCircuitUndo(ctx *gin.Context) {
	var params SelectCircuitParams
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
