package api

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/abc401/digital-logic-simulator/db"
	"github.com/abc401/digital-logic-simulator/models"
	"github.com/gin-gonic/gin"
)

var Scenes []models.Scene
var CurrentScene models.IDType

var AllowedOrigins = []string{
	"http://localhost5173",
}

func CorsMiddleWare(ctx *gin.Context) {
	ctx.Header("Access-Control-Allow-Origin", "*")
	ctx.Next()

}

func ConfigHandelers(router gin.IRouter) {

	router.Use(CorsMiddleWare)
	tutorialsRouter := router.Group("/tutorials")
	tutorialsRouter.GET("/", GetAllTutorials)

	// circuitRouter := router.Group("/circuit")

	// circuitRouter.POST("/create", AddCircuit)
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

func GetAllTutorials(ctx *gin.Context) {
	type Res struct {
		LinkTitle    string  `json:"link_title"`
		DisplayTitle string  `json:"display_title"`
		Previous     *string `json:"previous"`
		Next         *string `json:"next"`
	}

	con := db.GetDBCon()
	tutorials := []models.Article{}
	con.Select("link_title", "display_title", "previous", "next").Find(&tutorials)
	res := []Res{}
	for i := 0; i < len(tutorials); i++ {
		tutorial := tutorials[i]

		currRes := Res{
			LinkTitle:    tutorial.LinkTitle,
			DisplayTitle: tutorial.DisplayTitle,
		}
		if tutorial.Next.Valid {
			currRes.Next = &tutorial.Next.String
		} else {
			currRes.Next = nil
		}
		if tutorial.Previous.Valid {

			currRes.Previous = &tutorial.Previous.String
		} else {
			currRes.Previous = nil
		}

		res = append(res, currRes)
	}
	ctx.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	ctx.JSON(http.StatusOK, res)
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

	defaultValue, err := models.DefaultCircuits[strings.ToLower(params.CircuitType)]
	if err {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Invalid Circuit type: %s", params.CircuitType),
		})
	}

	defaultValue.ID = params.ID
	defaultValue.Pos = models.Vec2{

		X: params.PosXWrl,
		Y: params.PosYWrl,
	}
	fmt.Printf("\n\nProject State: %+v\n\n\n", currentScene)
}

func AddWire(ctx *gin.Context) {
}
