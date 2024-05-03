package api

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/abc401/digital-logic-simulator/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

var Scenes []models.Scene
var CurrentScene models.IDType

func ConfigHandelers(router gin.IRouter) {

	circuitRouter := router.Group("/circuit")

	circuitRouter.POST("/create", AddCircuit)
}

func InitState() {
	Scenes = []models.Scene{
		{
			ID:        models.DEFAULT_SCENE_ID,
			Name:      models.DEFAULT_SCENE_NAME,
			ICInputs:  models.NullableID{},
			ICOutputs: models.NullableID{},
			Circuits:  map[models.IDType]models.Circuit{},
		},
	}
	CurrentScene = models.DEFAULT_SCENE_ID
}

func AddCircuit(ctx *gin.Context) {
	type Params struct {
		ID          models.IDType `json:"id"`
		CircuitType string        `json:"type"`
		PosXWrl     float64       `json:"pos-x-wrl"`
		PosYWrl     float64       `json:"pos-y-wrl"`
	}

	var params Params
	if err := ctx.BindJSON(&params); err != nil {
		msg := "Incorrect Parameters"
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		fmt.Fprintf(os.Stderr, "\n\nError: %s\n\n\n", msg)
		return
	}

	currentScene := Scenes[CurrentScene]
	if _, err := currentScene.Circuits[params.ID]; err {
		ctx.JSON(http.StatusConflict, gin.H{
			"error": fmt.Sprintf("Another circuit is already registered with id: %d", params.ID),
		})
		return
	}

	isCircuitTypeValid := false
	for i := 0; i < len(models.ValidCircuitTypes); i++ {
		if strings.ToLower(params.CircuitType) == models.ValidCircuitTypes[i] {
			isCircuitTypeValid = true
			break
		}
	}
	if !isCircuitTypeValid {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Invalid Circuit type: %s", params.CircuitType),
		})

	}

	caser := cases.Title(language.AmericanEnglish)
	currentScene.Circuits[params.ID] = models.Circuit{
		ID:   params.ID,
		Type: params.CircuitType,
		Pos: models.Vec2{
			X: params.PosXWrl,
			Y: params.PosYWrl,
		},
		Props: models.CircuitProps{
			"label": caser.String(params.CircuitType),
		},
	}
	fmt.Printf("\n\nProject State: %+v\n\n\n", currentScene)

}
