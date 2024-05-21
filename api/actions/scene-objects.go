package actions

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/abc401/digital-logic-simulator/api/helpers"
	"github.com/abc401/digital-logic-simulator/api/projectstate"
	"github.com/abc401/digital-logic-simulator/math"
	"github.com/gin-gonic/gin"
)

type CreateCircuitParams struct {
	CircuitID   projectstate.IDType ``
	CircuitType string              `binding:"required"`
	LocScr      math.Vec2           `binding:"required"`
}

func CreateCircuitDo(ctx *gin.Context) {
	var params CreateCircuitParams
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = projectstate.GetProject()
	currentScene := project.GetCurrentScene()

	newCircuit, ok := projectstate.DefaultCircuits[strings.ToLower(params.CircuitType)]

	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":        "Invalid circuit type.",
			"circuit-type": params.CircuitType,
		})
	}

	newCircuit.ID = params.CircuitID
	newCircuit.PosWrl = project.View.ScreenToWorld(params.LocScr)

	if err := currentScene.AddCircuit(params.CircuitID, newCircuit); err != nil {
		ctx.JSON(http.StatusConflict, gin.H{
			"error": "Specified id is already in use by another circuit.",
			"id":    params.CircuitID,
		})
		return
	}
	helpers.PrintCurrentScene(project)
	fmt.Printf("Created Circuit: %s\n", helpers.SPrettyPrint(newCircuit))
	ctx.JSON(http.StatusOK, gin.H{})
}

func CreateCircuitUndo(ctx *gin.Context) {
	var params CreateCircuitParams
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = projectstate.GetProject()
	currentScene := project.GetCurrentScene()

	helpers.PrintCurrentScene(project)

	if err := currentScene.DeleteCircuit(params.CircuitID); err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error":      "Circuit does not exist.",
			"circuit-id": params.CircuitID,
		})
		return
	}

	helpers.PrintCurrentScene(project)
	ctx.JSON(http.StatusOK, gin.H{})
}
