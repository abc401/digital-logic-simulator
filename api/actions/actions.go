package actions

import "github.com/gin-gonic/gin"

func ConfigHandlers(router gin.IRouter) {
	router.POST("/pan/do", PanDo)
	router.POST("/pan/undo", PanUndo)

	router.POST("/mouse-zoom/do", MouseZoomDo)
	router.POST("/mouse-zoom/undo", MouseZoomUndo)

	router.POST("/select-circuit/do", SelectCircuitDo)
	router.POST("/select-circuit/undo", DeselectCircuitDo)

	router.POST("/deselect-circuit/do", DeselectCircuitDo)
	router.POST("/deselect-circuit/undo", SelectCircuitDo)
}
