package helpers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/abc401/digital-logic-simulator/api/projectstate"
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
		return false
	}
	fmt.Println("Target: ", target)
	return true
}

func PrintCurrentScene(project *projectstate.ProjectType) {
	fmt.Printf("\n\n[Info] Circuit in current scene:\n%s\n\n", SPrettyPrint(project.GetCurrentScene()))
}

func SPrettyPrint(val interface{}) string {
	json, err := json.MarshalIndent(val, "", "  ")
	if err != nil {
		log.Fatalf(err.Error())
	}
	return string(json)
}

func PrintReqBody(ctx *gin.Context) {
	var body map[string]interface{}

	if err := ctx.ShouldBindBodyWith(&body, binding.JSON); err != nil {

		fmt.Println("Could not read request body: ", err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not read request body",
		})
		panic("")
	}

	fmt.Println("Request Body: ", SPrettyPrint(body))

	// ctx.Request.Body = io.NopCloser(bytes.NewReader(body))

	ctx.Next()

}
