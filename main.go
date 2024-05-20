package main

import (
	"net/http"

	"github.com/abc401/digital-logic-simulator/api"
	"github.com/abc401/digital-logic-simulator/db"
	"github.com/gin-gonic/gin"
)

func main1() {

	router := gin.Default()
	router.StaticFS("/static", http.Dir("client/static/"))
	router.StaticFS("/dls", http.Dir("client/dls/build/"))
	router.GET("/", func(ctx *gin.Context) {
		ctx.Redirect(http.StatusTemporaryRedirect, "/static")
	})
	var apiRouter = router.Group("/api")
	api.ConfigHandelers(apiRouter)
	router.Run()
}

func main() {
	main1()
	// tmp()
	// db.AutoMigrate()
	// db.AddTutorials(Tutorials)
	// db.AddTutorial(
	// 	&models.Article{
	// 		Title:   "",
	// 		Content: ``,
	// 	},
	// )
}

func tmp() {
	db.AddMCQs()

}
