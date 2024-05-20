package actions

import (
	"fmt"
	"net/http"

	"github.com/abc401/digital-logic-simulator/api/helpers"
	"github.com/abc401/digital-logic-simulator/api/state"
	"github.com/abc401/digital-logic-simulator/math"
	"github.com/gin-gonic/gin"
)

type PanParams struct {
	DeltaScr math.Vec2 `bind:"required"`
}

func PanDo(ctx *gin.Context) {
	var params PanParams
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = state.GetProject()
	// fmt.Printf("\n\nPrevious View: %s\n", helpers.SPrettyPrint(project.View))
	project.View.PanOffset = project.View.PanOffset.Add(params.DeltaScr)
	// fmt.Printf("Current View: %s\n\n", helpers.SPrettyPrint(project.View))
	ctx.JSON(http.StatusOK, gin.H{
		"current-view": project.View,
	})
}

func PanUndo(ctx *gin.Context) {
	var params PanParams
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = state.GetProject()
	// fmt.Printf("Previous View: %s", SPrettyPrint(View))
	project.View.PanOffset = project.View.PanOffset.Sub(params.DeltaScr)
	// fmt.Printf("Current View: %s", SPrettyPrint(View))
	ctx.JSON(http.StatusOK, gin.H{
		"current-view": project.View,
	})
}

type MouseZoomParams struct {
	ZoomOriginScr  math.Vec2 `bind:"required"`
	ZoomLevelDelta float64   `bind:"required"`
}

func MouseZoomDo(ctx *gin.Context) {
	var params MouseZoomParams
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = state.GetProject()

	fmt.Printf("\n\nPrevious View: %s\n", helpers.SPrettyPrint(project.View))
	project.View.MouseZoom(params.ZoomOriginScr, project.View.ZoomLevel+params.ZoomLevelDelta)
	fmt.Printf("Current View: %s\n\n", helpers.SPrettyPrint(project.View))
	ctx.JSON(http.StatusOK, gin.H{
		"current-view": project.View,
	})
}
func MouseZoomUndo(ctx *gin.Context) {
	var params MouseZoomParams
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = state.GetProject()

	fmt.Printf("\n\nPrevious View: %s\n", helpers.SPrettyPrint(project.View))
	project.View.MouseZoom(params.ZoomOriginScr, project.View.ZoomLevel-params.ZoomLevelDelta)
	fmt.Printf("Current View: %s\n\n", helpers.SPrettyPrint(project.View))
	ctx.JSON(http.StatusOK, gin.H{
		"current-view": project.View,
	})
}
