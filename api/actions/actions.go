package actions

import "github.com/gin-gonic/gin"

func ConfigHandlers(router gin.IRouter) {
	router.POST("/pan/do", PanDo)
	router.POST("/pan/undo", PanUndo)

	router.POST("/mouse-zoom/do", MouseZoomDo)
	router.POST("/mouse-zoom/undo", MouseZoomUndo)

	router.POST("/touch-screen-zoom/do", TouchScreenZoomDo)
	router.POST("/touch-screen-zoom/undo", TouchScreenZoomUndo)

	router.POST("/select-circuit/do", SelectCircuitDo)
	router.POST("/select-circuit/undo", DeselectCircuitDo)

	router.POST("/deselect-circuit/do", DeselectCircuitDo)
	router.POST("/deselect-circuit/undo", SelectCircuitDo)

	router.POST("/create-circuit/do", CreateCircuitDo)
	router.POST("/create-circuit/undo", CreateCircuitUndo)

	router.POST("/create-wire/do", CreateWireDo)
	router.POST("/create-wire/undo", CreateWireUndo)
}
