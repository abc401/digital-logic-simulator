package actions

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/abc401/digital-logic-simulator/api/helpers"
	"github.com/abc401/digital-logic-simulator/api/state"
	"github.com/abc401/digital-logic-simulator/math"
	"github.com/gin-gonic/gin"
)

type WireParams struct {
	WireID            state.IDType `binding:"required"`
	ProducerCircuitID state.IDType
	ConsumerCircuitID state.IDType
	ProducerPinIdx    uint64
	ConsumerPinIdx    uint64
}

func CreateWireDo(ctx *gin.Context) {

	var params WireParams

	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = state.GetProject()
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

	if params.ProducerPinIdx > producerCircuit.NOutputPins-1 {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error":           "producer circuit does not have a pin at specified index",
			"specified-index": params.ProducerPinIdx,
		})
	}
	if params.ConsumerPinIdx > consumerCircuit.NInputPins-1 {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error":           "consumer circuit does not have a pin at specified index",
			"specified-index": params.ConsumerPinIdx,
		})
	}

	// TODO: Check whether the wire is originating from an ICInput circuit or going into an ICOutput
	// 		 circuit and, if so, appropriately increment the NConsumerPins and NProducerPins property
	//		 of those circuits
	var newWire = state.Wire{
		ID:          params.WireID,
		FromCircuit: params.ProducerCircuitID,
		FromPin:     params.ProducerPinIdx,
		ToCircuit:   params.ConsumerCircuitID,
		ToPin:       params.ConsumerPinIdx,
	}

	currentScene.Wires[params.WireID] = &newWire
	var fromCircuit = currentScene.GetCircuit(params.ProducerCircuitID)

	fromCircuit.OutputWires[newWire.FromPin] = &newWire
	if fromCircuit.CircuitType == "customcircuitinputs" && (newWire.FromPin == fromCircuit.NOutputPins-1) {
		fromCircuit.NOutputPins++
		fromCircuit.OutputWires = append(fromCircuit.OutputWires, nil)
	}

	var toCircuit = currentScene.GetCircuit(params.ConsumerCircuitID)
	toCircuit.InputWires[newWire.ToPin] = &newWire
	if toCircuit.CircuitType == "customcircuitoutputs" && (newWire.ToPin == toCircuit.NInputPins-1) {
		toCircuit.NInputPins++
		toCircuit.InputWires = append(toCircuit.InputWires, nil)
	}

	helpers.PrintCurrentScene(project)
	ctx.JSON(http.StatusOK, gin.H{})
}

func CreateWireUndo(ctx *gin.Context) {
	var params WireParams

	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = state.GetProject()
	currentScene := project.GetCurrentScene()

	helpers.PrintCurrentScene(project)

	if !currentScene.HasWire(params.WireID) {
		ctx.JSON(http.StatusConflict, gin.H{
			"error": "no wire with provided id",
			"id":    params.WireID,
		})
		return
	}

	var wire = currentScene.GetWire(params.WireID)

	var fromCircuit = currentScene.GetCircuit(wire.FromCircuit)
	fromCircuit.OutputWires[wire.FromPin] = nil

	var toCircuit = currentScene.GetCircuit(wire.ToCircuit)
	toCircuit.InputWires[wire.ToPin] = nil

	delete(currentScene.Wires, params.WireID)

	helpers.PrintCurrentScene(project)
	ctx.JSON(http.StatusOK, gin.H{})
}

type CreateCircuitParams struct {
	CircuitID   state.IDType ``
	CircuitType string       `binding:"required"`
	LocScr      math.Vec2    `binding:"required"`
}

func CreateCircuitDo(ctx *gin.Context) {
	var params CreateCircuitParams
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = state.GetProject()
	currentScene := project.GetCurrentScene()

	newCircuit, ok := state.DefaultCircuits[params.CircuitType]

	if !ok {
		var sceneID = -1
		var icType = ""
		for id, ic := range project.ICs {
			if !strings.EqualFold(ic, params.CircuitType) {
				continue
			}
			sceneID = int(id)
			icType = ic
		}

		if sceneID == -1 {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error":        "Invalid circuit type.",
				"circuit-type": params.CircuitType,
			})
		}

		var targetScene = project.Scenes[state.IDType(sceneID)]

		var icInputsID, _ = targetScene.ICInputs.Unwrap()
		var ICInputs = targetScene.GetCircuit(icInputsID)

		var icOutputsID, _ = targetScene.ICOutputs.Unwrap()
		var ICOutputs = targetScene.GetCircuit(icOutputsID)

		newCircuit = state.Circuit{
			CircuitType: icType,
			NInputPins:  ICInputs.NInputPins,
			NOutputPins: ICOutputs.NOutputPins,
			Props:       state.CircuitProps{},
		}
	}

	newCircuit.ID = params.CircuitID
	newCircuit.PosWrl = project.View.ScreenToWorld(params.LocScr)
	newCircuit.InputWires = make([]*state.Wire, newCircuit.NInputPins)
	newCircuit.OutputWires = make([]*state.Wire, newCircuit.NOutputPins)

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

	var project = state.GetProject()
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
