package actions

import (
	"net/http"

	"github.com/abc401/digital-logic-simulator/api/helpers"
	"github.com/abc401/digital-logic-simulator/api/projectstate"
	"github.com/gin-gonic/gin"
)

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
