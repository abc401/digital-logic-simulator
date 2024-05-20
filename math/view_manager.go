package math

type ViewManager struct {
	ZoomLevel float64 `bind:"required"`
	PanOffset Vec2    `bind:"required"`
}

func NewViewManager() ViewManager {
	return ViewManager{
		ZoomLevel: 1,
		PanOffset: NewVec2(0, 0),
	}
}

const MIN_ZOOM = 0.2
const MAX_ZOOM = 40

func (view *ViewManager) ScreenToWorld(vecScr Vec2) Vec2 {
	return vecScr.Sub(view.PanOffset).ScalarDiv(view.ZoomLevel)
}

func (view *ViewManager) MouseZoom(zoomOriginScr Vec2, newZoomLevel float64) {
	newZoomLevel = Clamp(newZoomLevel, MIN_ZOOM, MAX_ZOOM)
	if view.ZoomLevel == newZoomLevel {
		return
	}

	zoomOriginWrl := view.ScreenToWorld(zoomOriginScr)
	view.ZoomLevel = newZoomLevel
	view.PanOffset = zoomOriginScr.Sub(zoomOriginWrl.ScalarMul(view.ZoomLevel))

}
