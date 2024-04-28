package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type IDType uint64

type CircuitProps map[string]interface{}

type Circuit struct {
	Type  string
	Props CircuitProps

	CircuitSceneData
}

type CircuitSceneData struct {
	ID  IDType
	Pos struct {
		x float64
		y float64
	}
}

type Scene struct {
	ID        IDType
	Name      string
	ICInputs  IDType
	ICOutputs IDType
	Circuits  []Circuit
}

type Project struct {
	ID     IDType
	Name   string
	Scenes map[IDType]Scene
}

func main() {
	router := gin.Default()
	router.GET("/", func(ctx *gin.Context) {
		ctx.String(http.StatusOK, "Hello World")
	})
	router.Run()
}
