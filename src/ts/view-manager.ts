import { MAX_ZOOM, MIN_ZOOM } from "./config.js";
import { Rect, Vec2, clamp } from "./math.js";

export class ViewManager {
  zoomLevel: number;
  panOffset: Vec2;

  constructor() {
    this.zoomLevel = 1;
    this.panOffset = new Vec2(0, 0);
  }

  pan(amount: Vec2) {
    this.panOffset = this.panOffset.add(amount);
  }

  zoom(zoomOriginS: Vec2, newZoomLevel: number) {
    newZoomLevel = clamp(newZoomLevel, MIN_ZOOM, MAX_ZOOM);

    if (this.zoomLevel !== newZoomLevel) {
      let zoomOriginW = this.screenToWorld(zoomOriginS);
      this.zoomLevel = newZoomLevel;

      this.panOffset = new Vec2(
        zoomOriginS.x - zoomOriginW.x * this.zoomLevel,
        zoomOriginS.y - zoomOriginW.y * this.zoomLevel
      );
    }
  }

  worldToScreen(coord: Vec2) {
    return coord.scalarMul(this.zoomLevel).add(this.panOffset);
  }

  screenToWorld(coord: Vec2) {
    return coord.sub(this.panOffset).scalarDiv(this.zoomLevel);
  }

  worldToScreenRect(rect: Rect) {
    return new Rect(
      rect.x * this.zoomLevel + this.panOffset.x,
      rect.y * this.zoomLevel + this.panOffset.y,
      rect.w * this.zoomLevel,
      rect.h * this.zoomLevel
    );
  }
}
