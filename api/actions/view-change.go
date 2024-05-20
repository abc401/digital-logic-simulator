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
	DeltaScr math.Vec2 `binding:"required"`
}

func PanDo(ctx *gin.Context) {
	var params PanParams
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = state.GetProject()
	fmt.Printf("\n\nPrevious View: %s\n", helpers.SPrettyPrint(project.View))
	project.View.PanOffset = project.View.PanOffset.Add(params.DeltaScr)
	fmt.Printf("Current View: %s\n\n", helpers.SPrettyPrint(project.View))
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
	fmt.Printf("Previous View: %s", helpers.SPrettyPrint(project.View))
	project.View.PanOffset = project.View.PanOffset.Sub(params.DeltaScr)
	fmt.Printf("Current View: %s", helpers.SPrettyPrint(project.View))
	ctx.JSON(http.StatusOK, gin.H{
		"current-view": project.View,
	})
}

type MouseZoomParams struct {
	ZoomOriginScr  math.Vec2 `binding:"required"`
	ZoomLevelDelta float64   `binding:"required"`
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

func TouchScreenZoomDo(ctx *gin.Context) {
	type Params struct {
		EndingView math.ViewManager `binding:"required"`
	}

	var params Params

	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = state.GetProject()
	project.View = params.EndingView

	ctx.JSON(http.StatusOK, gin.H{})
}

func TouchScreenZoomUndo(ctx *gin.Context) {
	type Params struct {
		StartingView math.ViewManager `binding:"required"`
	}

	var params Params

	// if err := ctx.ShouldBindBodyWith(&params, binding.JSON); err != nil {
	// 	fmt.Fprintf(os.Stderr, "\n\nError: %s\n\n\n", err.Error())
	// 	ctx.JSON(http.StatusBadRequest, gin.H{
	// 		"error": err.Error(),
	// 	})
	// 	return
	// }
	// fmt.Println("Target: ", params)
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = state.GetProject()
	project.View = params.StartingView

	ctx.JSON(http.StatusOK, gin.H{})
}
