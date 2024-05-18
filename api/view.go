package api

import "github.com/abc401/digital-logic-simulator/math"

type ViewManager struct {
	ZoomLevel float64
	PanOffset math.Vec2
}

const MIN_ZOOM = 0.2
const MAX_ZOOM = 40

func (view *ViewManager) ScreenToWorld(vecScr math.Vec2) math.Vec2 {
	return vecScr.Sub(view.PanOffset).ScalarDiv(view.ZoomLevel)
}

func (view *ViewManager) MouseZoom(zoomOriginScr math.Vec2, newZoomLevel float64) {
	newZoomLevel = math.Clamp(newZoomLevel, MIN_ZOOM, MAX_ZOOM)
	if view.ZoomLevel == newZoomLevel {
		return
	}

	zoomOriginWrl := view.ScreenToWorld(zoomOriginScr)
	view.ZoomLevel = newZoomLevel
	view.PanOffset = zoomOriginScr.Sub(zoomOriginWrl.ScalarMul(view.ZoomLevel))

}
