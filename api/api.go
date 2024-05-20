package api

import (
	"fmt"
	"math/rand"
	"net/http"
	"strings"

	"github.com/abc401/digital-logic-simulator/db"
	"github.com/abc401/digital-logic-simulator/math"
	"github.com/abc401/digital-logic-simulator/models"

	// "github.com/abc401/digital-logic-simulator/models"
	"github.com/gin-gonic/gin"
)

var Scenes = []models.Scene{
	{
		ID:        models.DEFAULT_SCENE_ID,
		Name:      models.DEFAULT_SCENE_NAME,
		ICInputs:  models.NullableID{},
		ICOutputs: models.NullableID{},
		Circuits:  map[models.IDType]models.Circuit{},
	},
}
var CurrentScene = models.DEFAULT_SCENE_ID
var SelectedCircuits = map[models.IDType]bool{}
var View = math.NewViewManager()

var AllowedOrigins = []string{
	"http://localhost5173",
}

func ConfigHandelers(router gin.IRouter) {

	router.Use(CorsMiddleWare)
	router.Use(PrintReqBody)

	tutorialsRouter := router.Group("/tutorials")
	tutorialsRouter.GET("/nav", TutorialsNav)
	tutorialsRouter.GET("/:link_title", GetTutorial)

	action := router.Group("/action")
	{

		action.POST("/create-circuit", AddCircuit)
		action.POST("/drag-selection", DragSelection)

		action.POST("/select-circuit", SelectCircuitDo)
		action.POST("/deselect-circuit", DragSelection)

		action.POST("/pan/do", PanDo)
		action.POST("/pan/undo", PanUndo)

		action.POST("/mouse-zoom/do", MouseZoomDo)
		action.POST("/mouse-zoom/undo", MouseZoomUndo)
	}

	// circuitRouter := router.Group("/circuit")

	// circuitRouter.POST("/create", AddCircuit)
}

func InitState() {
}

func CorsMiddleWare(ctx *gin.Context) {
	ctx.Header("Access-Control-Allow-Origin", "*")
	ctx.Next()
}

func PanDo(ctx *gin.Context) {
	type Params struct {
		DeltaScr math.Vec2 `bind:"required"`
	}
	var params Params
	if !bindParams(&params, ctx) {
		return
	}

	// fmt.Printf("\n\nPrevious View: %s\n", SPrettyPrint(View))
	View.PanOffset = View.PanOffset.Add(params.DeltaScr)
	// fmt.Printf("Current View: %s\n\n", SPrettyPrint(View))
}
func PanUndo(ctx *gin.Context) {
	type Params struct {
		DeltaScr math.Vec2 `bind:"required"`
	}
	var params Params
	if !bindParams(&params, ctx) {
		return
	}
	// fmt.Printf("Previous View: %s", SPrettyPrint(View))
	View.PanOffset = View.PanOffset.Sub(params.DeltaScr)
	// fmt.Printf("Current View: %s", SPrettyPrint(View))
}

func MouseZoomDo(ctx *gin.Context) {
	type Params struct {
		ZoomOriginScr  math.Vec2 `bind:"required"`
		ZoomLevelDelta float64   `bind:"required"`
	}
	var params Params
	if !bindParams(&params, ctx) {
		return
	}

	fmt.Printf("\n\nPrevious View: %s\n", SPrettyPrint(View))
	View.MouseZoom(params.ZoomOriginScr, View.ZoomLevel+params.ZoomLevelDelta)
	fmt.Printf("Current View: %s\n\n", SPrettyPrint(View))
}
func MouseZoomUndo(ctx *gin.Context) {
	type Params struct {
		ZoomOriginScr  math.Vec2 `json:"zoomOriginScr" bind:"required"`
		ZoomLevelDelta float64   `json:"zoomLevelDelta" bind:"required"`
	}
	var params Params
	if !bindParams(&params, ctx) {
		return
	}

	fmt.Printf("\n\nPrevious View: %s\n", SPrettyPrint(View))
	View.MouseZoom(params.ZoomOriginScr, View.ZoomLevel-params.ZoomLevelDelta)
	fmt.Printf("Current View: %s\n\n", SPrettyPrint(View))
}

func SelectCircuitDo(ctx *gin.Context) {
	type Params struct {
		ID models.IDType `binding:"required"`
	}

	params := Params{}
	if !bindParams(&params, ctx) {
		return
	}

	if !Scenes[CurrentScene].HasCircuit(params.ID) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "No circuit with provided id",
			"id":    params.ID,
		})
	}

	SelectedCircuits[params.ID] = true

	PrintCurrentScene()
	ctx.JSON(http.StatusOK, gin.H{
		"selected-circuits": SelectedCircuits,
	})
}
func DeselectCircuit(ctx *gin.Context) {
	type Params struct {
		ID models.IDType `binding:"required"`
	}

	params := Params{}
	if !bindParams(&params, ctx) {
		return
	}

	if !Scenes[CurrentScene].HasCircuit(params.ID) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "No circuit with provided id",
			"id":    params.ID,
		})
	}

	delete(SelectedCircuits, params.ID)
	PrintCurrentScene()
	ctx.JSON(http.StatusOK, gin.H{
		"selected-circuits": SelectedCircuits,
	})
}

func AddCircuit(ctx *gin.Context) {
	type Params struct {
		ID          models.IDType `binding:"required"`
		CircuitType string        `json:"type" binding:"required"`
		PosWrl      math.Vec2     `binding:"required"`
	}

	var params Params
	if !bindParams(&params, ctx) {
		return
	}

	currentScene := Scenes[CurrentScene]
	if currentScene.HasCircuit(params.ID) {
		ctx.JSON(http.StatusConflict, gin.H{
			"error": fmt.Sprintf("Another circuit is already registered with id: %d", params.ID),
		})
		return
	}

	newCircuit, ok := models.DefaultCircuits[strings.ToLower(params.CircuitType)]
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Invalid circuit type: %s", params.CircuitType),
		})
	}

	newCircuit.ID = params.ID
	newCircuit.Pos = params.PosWrl
	currentScene.Circuits[params.ID] = newCircuit
	PrintCurrentScene()
	fmt.Printf("%+v\n", newCircuit)

	// fmt.Printf("\n\nProject State: %+v\n\n\n", currentScene)
}

func DragSelection(ctx *gin.Context) {
	type Params struct {
		DeltaWrl math.Vec2 `binding:"required"`
	}
	params := Params{}
	if !bindParams(&params, ctx) {
		return
	}

	for id := range SelectedCircuits {
		currentScene := Scenes[CurrentScene]

		circuit := currentScene.Circuits[id]
		{
			circuit.Pos = currentScene.Circuits[id].Pos.Add(params.DeltaWrl)
		}
		currentScene.Circuits[id] = circuit
	}
	PrintCurrentScene()

}

func GetTutorial(ctx *gin.Context) {
	title, found := ctx.Params.Get("link_title")
	if !found {
		panic("Wrong Parameter name")
	}
	fmt.Println("Title: ", title)
	con := db.GetGormDBCon()
	tutorial := models.Article{}

	con.Model(&models.Article{}).Preload("MCQs").Find(&tutorial)
	fmt.Println("Tutorial: ", tutorial.LinkTitle)

	type Res struct {
		LinkTitle    string       `json:"link_title"`
		DisplayTitle string       `json:"display_title"`
		Previous     *string      `json:"previous"`
		Next         *string      `json:"next"`
		Content      string       `json:"content"`
		MCQs         []models.MCQ `json:"mcqs"`
	}
	res := Res{
		LinkTitle:    tutorial.LinkTitle,
		DisplayTitle: tutorial.DisplayTitle,
		Content:      tutorial.Content,
		MCQs:         []models.MCQ{},
	}
	if tutorial.Previous.Valid {
		res.Previous = &tutorial.Previous.String
	}
	if tutorial.Next.Valid {
		res.Next = &tutorial.Next.String
	}

	for i := 0; i < 5; i++ {
		rnd := rand.Intn(len(tutorial.MCQs))
		res.MCQs = append(res.MCQs, tutorial.MCQs[rnd])
	}

	ctx.JSON(http.StatusOK, res)

}

func TutorialsNav(ctx *gin.Context) {
	type Res struct {
		LinkTitle    string  `json:"link_title"`
		DisplayTitle string  `json:"display_title"`
		Previous     *string `json:"previous"`
		Next         *string `json:"next"`
	}

	con := db.GetGormDBCon()
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
	ctx.JSON(http.StatusOK, res)
}
