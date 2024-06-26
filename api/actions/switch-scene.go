package actions

import (
	"fmt"
	"net/http"

	"github.com/abc401/digital-logic-simulator/api/helpers"
	"github.com/abc401/digital-logic-simulator/api/state"
	"github.com/gin-gonic/gin"
)

type SwitchSceneParams struct {
	FromSceneID      state.IDType
	ToSceneID        state.IDType
	SelectedCircuits []state.IDType
	SelectedWires    []state.IDType
}

func SwitchSceneDo(ctx *gin.Context) {

	var params SwitchSceneParams
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = state.GetProject()
	if _, ok := project.Scenes[params.ToSceneID]; !ok {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "no scene with specified id",
			"id":    params.ToSceneID,
		})
		return
	}
	project.CurrentSceneID = params.ToSceneID
	project.SelectedCircuits = map[state.IDType]bool{}
	ctx.JSON(http.StatusOK, gin.H{})
	fmt.Printf("\n\nProject State: %s\n\n", helpers.SPrettyPrint(project))
}

func SwitchSceneUndo(ctx *gin.Context) {
	var params SwitchSceneParams
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = state.GetProject()
	if _, ok := project.Scenes[params.FromSceneID]; !ok {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "no scene with specified id",
			"id":    params.ToSceneID,
		})
		return
	}

	project.CurrentSceneID = params.FromSceneID
	var currentScene = project.GetCurrentScene()

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
		if !currentScene.HasWire(id) {
			ctx.JSON(http.StatusNotFound, gin.H{
				"error": "no wire with specified id",
				"id":    id,
			})
			return
		}
	}

	for _, id := range params.SelectedCircuits {
		project.SelectedCircuits[id] = true
	}

	for _, id := range params.SelectedWires {
		project.SelectedWires[id] = true
	}

	ctx.JSON(http.StatusOK, gin.H{})

	fmt.Printf("\n\nProject State: %s\n\n", helpers.SPrettyPrint(project))
}
