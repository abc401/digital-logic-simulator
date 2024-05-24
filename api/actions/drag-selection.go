package actions

import (
	"net/http"

	"github.com/abc401/digital-logic-simulator/api/helpers"
	"github.com/abc401/digital-logic-simulator/api/state"
	"github.com/abc401/digital-logic-simulator/math"
	"github.com/gin-gonic/gin"
)

func DragSelectionDo(ctx *gin.Context) {
	type Params struct {
		DeltaWrl math.Vec2 `binding:"required"`
	}
	var params Params
	if !helpers.BindParams(&params, ctx) {
		return
	}
	var project = state.GetProject()
	var currentScene = project.GetCurrentScene()

	for id := range project.SelectedCircuits {

		circuit := currentScene.GetCircuit(id)
		circuit.PosWrl = circuit.PosWrl.Add(params.DeltaWrl)
	}
	helpers.PrintCurrentScene(project)
	ctx.JSON(http.StatusOK, gin.H{})
}

func DragSelectionUndo(ctx *gin.Context) {
	type Params struct {
		DeltaWrl math.Vec2 `binding:"required"`
	}
	var params Params
	if !helpers.BindParams(&params, ctx) {
		return
	}
	var project = state.GetProject()
	var currentScene = project.GetCurrentScene()

	for id := range project.SelectedCircuits {

		circuit := currentScene.GetCircuit(id)
		circuit.PosWrl = circuit.PosWrl.Sub(params.DeltaWrl)
	}
	helpers.PrintCurrentScene(project)
	ctx.JSON(http.StatusOK, gin.H{})
}
