package actions

import (
	"net/http"

	"github.com/abc401/digital-logic-simulator/api/helpers"
	"github.com/abc401/digital-logic-simulator/api/state"
	"github.com/gin-gonic/gin"
)

type SelectDeselectParams struct {
	CircuitID state.IDType `json:"circuitID" binding:"required"`
}

func SelectCircuitDo(ctx *gin.Context) {
	var params SelectDeselectParams
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = state.GetProject()

	if !project.GetCurrentScene().HasCircuit(params.CircuitID) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "No circuit with provided id",
			"id":    params.CircuitID,
		})
	}

	project.SelectedCircuits[params.CircuitID] = true

	helpers.PrintCurrentScene(project)
	ctx.JSON(http.StatusOK, gin.H{
		"selected-circuits": project.SelectedCircuits,
	})
}
func DeselectCircuitDo(ctx *gin.Context) {

	var params SelectDeselectParams
	if !helpers.BindParams(&params, ctx) {
		return
	}
	var project = state.GetProject()

	if !project.GetCurrentScene().HasCircuit(params.CircuitID) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "No circuit with provided id",
			"id":    params.CircuitID,
		})
	}

	delete(project.SelectedCircuits, params.CircuitID)

	helpers.PrintCurrentScene(project)
	ctx.JSON(http.StatusOK, gin.H{
		"selected-circuits": project.SelectedCircuits,
	})

}
