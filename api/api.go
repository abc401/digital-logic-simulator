package api

import (
	"fmt"
	"net/http"
	"os"

	"github.com/abc401/digital-logic-simulator/internal"
	"github.com/gin-gonic/gin"
)

func ConfigHandelers(router gin.IRouter) {

	router.POST("/create-project", CreateProject)

}

func CreateProject(ctx *gin.Context) {
	type Params struct {
		Name string `json:"name"`
	}

	var params Params

	if err := ctx.BindJSON(&params); err != nil {
		msg := "Incorrect Parameters"
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": msg,
		})
		fmt.Fprintf(os.Stderr, "\n\nError: %s\n\n\n", msg)
		return

	}
	project := internal.NewProject(params.Name)

	internal.Projects = append(internal.Projects, project)

	ctx.JSON(http.StatusOK, gin.H{
		"id": project.ID,
	})
	fmt.Printf("\n\nCreated project: %v\n\n\n", project)
}
