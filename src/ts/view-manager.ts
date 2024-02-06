import { MAX_ZOOM, MIN_ZOOM } from "./config.js";
import { Rect, Vec2, clamp } from "./math.js";

export class ViewManager {
  zoomLevel: number;
  panOffset: Vec2;

  constructor() {
    this.zoomLevel = 1;
    this.panOffset = new Vec2(0, 0);
  }

  setZoomLevel(zoomLevel: number) {
    this.zoomLevel = clamp(zoomLevel, MIN_ZOOM, MAX_ZOOM);
  }

  getZoomLevel() {
    return this.zoomLevel;
  }

  pan(amount: Vec2) {
    this.panOffset = this.panOffset.add(amount);
  }

  zoom(origin: Vec2, multiplier: number) {}

  applyZoomScalar(scalar: number) {
    return scalar * this.zoomLevel;
  }

  applyZoom(coord: Vec2) {
    return coord.scalarMul(this.zoomLevel);
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
