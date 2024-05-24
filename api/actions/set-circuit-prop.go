package actions

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/abc401/digital-logic-simulator/api/helpers"
	"github.com/abc401/digital-logic-simulator/api/state"
	"github.com/gin-gonic/gin"
)

type SetCircuitPropParams struct {
	CircuitID    state.IDType
	PropName     string `binding:"required"`
	ValueToSet   string `binding:"required"`
	CurrentValue string `binding:"required"`
}

func SetCircuitPropDo(ctx *gin.Context) {

	var params SetCircuitPropParams
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = state.GetProject()
	var currentScene = project.GetCurrentScene()
	circuit, ok := currentScene.Circuits[params.CircuitID]

	if !ok {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "no circuit with specified id",
			"id":    params.CircuitID,
		})
	}

	var propName = strings.ToLower((params.PropName))
	var circuitType = strings.ToLower(circuit.CircuitType)

	setter, ok := state.CircuitPropSetters["*"][propName]
	if !ok {
		setter, ok = state.CircuitPropSetters[circuitType][propName]
		if !ok {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("circuit with id %d does not have the '%s' prop", params.CircuitID, params.PropName),
			})
			return
		}
	}
	if !setter(circuit, params.ValueToSet) {
		fmt.Printf("\n[Error] Could not set '%s' prop of circuit to %s\n", propName, helpers.SPrettyPrint(params.ValueToSet))
		fmt.Printf("\n[Info] Circuit: %s\n", helpers.SPrettyPrint(circuit))
		return
	}

	fmt.Println("\n[Success] Successfully set prop.")
	fmt.Printf("\n[Info] Project: %s\n", helpers.SPrettyPrint(project))
	fmt.Printf("\n[Info] Circuit: %s\n", helpers.SPrettyPrint(circuit))
	ctx.JSON(http.StatusOK, gin.H{})

}

func SetCircuitPropUndo(ctx *gin.Context) {

	var params SetCircuitPropParams
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = state.GetProject()
	var currentScene = project.GetCurrentScene()
	circuit, ok := currentScene.Circuits[params.CircuitID]
	if !ok {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "no circuit with specified id",
			"id":    params.CircuitID,
		})
		return
	}

	setter, ok := state.CircuitPropSetters["*"][strings.ToLower(params.PropName)]
	if !ok {
		setter, ok = state.CircuitPropSetters[strings.ToLower(circuit.CircuitType)][strings.ToLower(params.PropName)]
		if !ok {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("circuit with id %d does not have the '%s' prop", params.CircuitID, params.PropName),
			})
			return
		}
	}
	if !setter(circuit, params.CurrentValue) {
		fmt.Printf("\n[Error] Could not set '%s' prop of circuit to %+v\n", params.PropName, params.CurrentValue)
		fmt.Printf("\n[Info] Circuit: %s\n", helpers.SPrettyPrint(circuit))
		return
	}

	fmt.Println("\n[Success] Successfully set prop.")
	fmt.Printf("\n[Info] Project: %s\n", helpers.SPrettyPrint(project))
	fmt.Printf("\n[Info] Circuit: %s\n", helpers.SPrettyPrint(circuit))
	ctx.JSON(http.StatusOK, gin.H{})
}
