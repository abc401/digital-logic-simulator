package api

import (
	"fmt"
	"net/http"
	"os"

	"github.com/abc401/digital-logic-simulator/models"
	"github.com/gin-gonic/gin"
)

func bindParams(target interface{}, ctx *gin.Context) bool {
	if err := ctx.BindJSON(target); err != nil {
		fmt.Fprintf(os.Stderr, "\n\nError: %s\n\n\n", err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return false
	}
	fmt.Println("Target: ", target)
	return true
}

func PrintCurrentScene() {
	fmt.Printf("\n\n[Info] Circuit in current scene:\n%s\n\n", models.SPrettyPrint(Scenes[CurrentScene]))
}
