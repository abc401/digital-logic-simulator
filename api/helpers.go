package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

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
	fmt.Printf("\n\n[Info] Circuit in current scene:\n%s\n\n", SPrettyPrint(Scenes[CurrentScene]))
}

func SPrettyPrint(val interface{}) string {
	json, err := json.MarshalIndent(val, "", "  ")
	if err != nil {
		log.Fatalf(err.Error())
	}
	return string(json)
}

func PrintReqBody(ctx *gin.Context) {
	body, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		fmt.Println("Could not read request body: ", err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not read request body",
		})
		panic("")
	}

	fmt.Println("Request Body: ", string(body))
	ctx.Request.Body = io.NopCloser(bytes.NewReader(body))

	ctx.Next()

}
