package api

import (
	"fmt"
	"math/rand"
	"net/http"

	"github.com/abc401/digital-logic-simulator/api/actions"
	"github.com/abc401/digital-logic-simulator/api/helpers"
	"github.com/abc401/digital-logic-simulator/db"
	"github.com/abc401/digital-logic-simulator/models"

	// "github.com/abc401/digital-logic-simulator/models"
	"github.com/gin-gonic/gin"
)

var AllowedOrigins = []string{
	"http://localhost5173",
}

func ConfigHandelers(router gin.IRouter) {

	router.Use(CorsMiddleWare)
	router.Use(helpers.PrintReqBody)

	tutorialsRouter := router.Group("/tutorials")
	tutorialsRouter.GET("/nav", TutorialsNav)
	tutorialsRouter.GET("/:link_title", GetTutorial)

	action := router.Group("/action")
	actions.ConfigHandlers(action)
}

func CorsMiddleWare(ctx *gin.Context) {
	ctx.Header("Access-Control-Allow-Origin", "*")
	ctx.Next()
}

// func DragSelection(ctx *gin.Context) {
// 	type Params struct {
// 		DeltaWrl math.Vec2 `binding:"required"`
// 	}
// 	params := Params{}
// 	if !BindParams(&params, ctx) {
// 		return
// 	}

// 	for id := range SelectedCircuits {
// 		currentScene := Scenes[CurrentScene]

// 		circuit := currentScene.Circuits[id]
// 		{
// 			circuit.Pos = currentScene.Circuits[id].Pos.Add(params.DeltaWrl)
// 		}
// 		currentScene.Circuits[id] = circuit
// 	}
// 	PrintCurrentScene()

// }

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
