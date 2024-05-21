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
			"error": err.Error(),
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

func CreateWireDo(ctx *gin.Context) {
	type Params struct {
		WireID            projectstate.IDType `binding:"required"`
		ProducerCircuitID projectstate.IDType
		ConsumerCircuitID projectstate.IDType
		ProducerPinIdx    uint64
		ConsumerPinIdx    uint64
	}

	var params Params

	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = projectstate.GetProject()
	currentScene := project.GetCurrentScene()

	helpers.PrintCurrentScene(project)

	if currentScene.HasObject(params.WireID) {
		ctx.JSON(http.StatusConflict, gin.H{
			"error": "id is already taken",
			"id":    params.WireID,
		})
		return
	}

	if !currentScene.HasCircuit(params.ConsumerCircuitID) {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error":        "circuit with specified id does not exist",
			"id":           params.ConsumerCircuitID,
			"circuit-role": "Consumer circuit",
		})
		return
	}
	consumerCircuit := currentScene.GetCircuit(params.ConsumerCircuitID)
	if consumerCircuit == nil {
		panic(`
⢰⣶⣶⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢻⣿⣿⡏⠉⠓⠦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀
⠀⠀⢹⣿⡇⠀⠀⠀⠈⠙⠲⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⡴⠖⢾⣿⣿⣿⡟
⠀⠀⠀⠹⣷⠀⠀⠀⠀⠀⠀⠀⠙⠦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⠶⠚⠋⠁⠀⠀⣸⣿⣿⡟⠀
⠀⠀⠀⠀⠹⣇⠀⠀⠀⠀⠀⠀⠀⠀⠈⠓⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡴⠖⠋⠁⠀⠀⠀⠀⠀⠀⠀⣿⣿⠏⠀⠀
⠀⠀⠀⠀⠀⠙⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢦⡀⠀⠀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⠀⣀⡤⠖⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⡿⠃⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⢳⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠉⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⡟⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠙⢦⡀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡴⠋⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣦⣠⡿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⡄⠀⠀⢀⡴⠟⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣦⠾⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠏⠀⠀⠀⠀⣠⣴⣶⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡴⣶⣦⡀⠀⠀⠀⠀⠀⠹⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡏⠀⠀⠀⠀⠀⣯⣀⣼⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣄⣬⣿⡇⠀⠀⠀⠀⠀⠀⠘⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⠁⠀⠀⠀⠀⠀⠻⣿⡿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠿⠿⠟⠀⠀⠀⠀⠀⠀⠀⠀⢹⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⡇⠀⢀⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣷⣶⠤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⡀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢸⢁⡾⠋⠉⠉⠙⢷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⠞⠋⠉⠛⢶⡄⠀⠀⠘⡇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣿⠸⣇⠀⠀⠀⠀⣸⠇⠀⠀⠀⠀⠀⢀⣠⠤⠴⠶⠶⣤⡀⠀⠀⠀⠀⠀⠀⣇⠀⠀⠀⠀⢀⡇⠀⠀⠀⢿⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢿⠀⠉⠳⠶⠶⠞⠁⠀⠀⠀⠀⠀⠀⢾⡅⠀⠀⠀⠀⠈⣷⠀⠀⠀⠀⠀⠀⠙⠷⢦⡤⠴⠛⠁⠀⠀⠀⢸⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠈⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣤⡀⠀⠀⣠⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡇⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠛⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣇⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣇⣀⣀⣀⣠⣠⣠⣠⣠⣀⣀⣀⣀⣀⣀⣄⣄⣄⣄⣄⣠⣀⣀⣀⣀⣠⣠⣠⣠⣠⣠⣀⣀⣀⣀⣀⣼⡆⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀`)
	}

	if !currentScene.HasCircuit(params.ProducerCircuitID) {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error":        "circuit with specified id does not exist",
			"id":           params.ProducerCircuitID,
			"circuit-role": "Producer circuit",
		})
		return
	}

	producerCircuit := currentScene.GetCircuit(params.ProducerCircuitID)
	if producerCircuit == nil {
		panic(`
⢰⣶⣶⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢻⣿⣿⡏⠉⠓⠦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀
⠀⠀⢹⣿⡇⠀⠀⠀⠈⠙⠲⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⡴⠖⢾⣿⣿⣿⡟
⠀⠀⠀⠹⣷⠀⠀⠀⠀⠀⠀⠀⠙⠦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⠶⠚⠋⠁⠀⠀⣸⣿⣿⡟⠀
⠀⠀⠀⠀⠹⣇⠀⠀⠀⠀⠀⠀⠀⠀⠈⠓⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡴⠖⠋⠁⠀⠀⠀⠀⠀⠀⠀⣿⣿⠏⠀⠀
⠀⠀⠀⠀⠀⠙⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢦⡀⠀⠀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⠀⣀⡤⠖⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⡿⠃⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⢳⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠉⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⡟⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠙⢦⡀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡴⠋⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣦⣠⡿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⡄⠀⠀⢀⡴⠟⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣦⠾⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠏⠀⠀⠀⠀⣠⣴⣶⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡴⣶⣦⡀⠀⠀⠀⠀⠀⠹⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡏⠀⠀⠀⠀⠀⣯⣀⣼⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣄⣬⣿⡇⠀⠀⠀⠀⠀⠀⠘⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⠁⠀⠀⠀⠀⠀⠻⣿⡿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠿⠿⠟⠀⠀⠀⠀⠀⠀⠀⠀⢹⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⡇⠀⢀⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣷⣶⠤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⡀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢸⢁⡾⠋⠉⠉⠙⢷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⠞⠋⠉⠛⢶⡄⠀⠀⠘⡇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣿⠸⣇⠀⠀⠀⠀⣸⠇⠀⠀⠀⠀⠀⢀⣠⠤⠴⠶⠶⣤⡀⠀⠀⠀⠀⠀⠀⣇⠀⠀⠀⠀⢀⡇⠀⠀⠀⢿⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢿⠀⠉⠳⠶⠶⠞⠁⠀⠀⠀⠀⠀⠀⢾⡅⠀⠀⠀⠀⠈⣷⠀⠀⠀⠀⠀⠀⠙⠷⢦⡤⠴⠛⠁⠀⠀⠀⢸⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠈⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣤⡀⠀⠀⣠⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡇⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠛⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣇⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣇⣀⣀⣀⣠⣠⣠⣠⣠⣀⣀⣀⣀⣀⣀⣄⣄⣄⣄⣄⣠⣀⣀⣀⣀⣠⣠⣠⣠⣠⣠⣀⣀⣀⣀⣀⣼⡆⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀`)
	}

	if params.ProducerPinIdx > producerCircuit.NProducerPins-1 {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error":           "producer circuit does not have a pin at specified index",
			"specified-index": params.ProducerPinIdx,
		})
	}
	if params.ConsumerPinIdx > consumerCircuit.NConsumerPins-1 {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error":           "consumer circuit does not have a pin at specified index",
			"specified-index": params.ConsumerPinIdx,
		})
	}
	currentScene.Wires[params.WireID] = &projectstate.Wire{
		ID:          params.WireID,
		FromCircuit: params.ProducerCircuitID,
		FromPin:     params.ProducerPinIdx,
		ToCircuit:   params.ConsumerCircuitID,
		ToPin:       params.ConsumerPinIdx,
	}

	helpers.PrintCurrentScene(project)
	ctx.JSON(http.StatusOK, gin.H{})
}

func CreateWireUndo(ctx *gin.Context) {
	type Params struct {
		WireID projectstate.IDType `binding:"required"`
	}

	var params Params

	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = projectstate.GetProject()
	currentScene := project.GetCurrentScene()

	helpers.PrintCurrentScene(project)

	if !currentScene.HasWire(params.WireID) {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "no wire with specified id",
			"id":    params.WireID,
		})
		return
	}

	delete(currentScene.Wires, params.WireID)

	helpers.PrintCurrentScene(project)
	ctx.JSON(http.StatusOK, gin.H{})
}
