package helpers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/abc401/digital-logic-simulator/api/state"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func BindParams(target interface{}, ctx *gin.Context) bool {
	if err := ctx.ShouldBindBodyWith(target, binding.JSON); err != nil {
		// if err := ctx.BindJSON(target); err != nil {
		fmt.Fprintf(os.Stderr, "\n\nError: %s\n\n\n", err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		ctx.Abort()
		return false
	}
	return true
}

func PrintCurrentScene(project *state.ProjectType) {
	fmt.Printf("\n\n[Info] Circuit in current scene:\n%s\n\n", SPrettyPrint(project.GetCurrentScene()))
}

func SPrettyPrint(val interface{}) string {
	json, err := json.MarshalIndent(val, "", "  ")
	if err != nil {
		log.Fatalf(err.Error())
	}
	return string(json)
}
