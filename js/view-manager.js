import { MAX_ZOOM, MIN_ZOOM } from "./config.js";
import { Rect, Vec2, clamp } from "./math.js";
export class ViewManager {
    constructor() {
        this.zoomLevel = 1;
        this.panOffset = new Vec2(0, 0);
    }
    pan(amountScr) {
        this.panOffset = this.panOffset.add(amountScr);
    }
    zoom(zoomOriginScr, newZoomLevel) {
        newZoomLevel = clamp(newZoomLevel, MIN_ZOOM, MAX_ZOOM);
        if (this.zoomLevel !== newZoomLevel) {
            let zoomOriginW = this.screenToWorld(zoomOriginScr);
            this.zoomLevel = newZoomLevel;
            this.panOffset = new Vec2(zoomOriginScr.x - zoomOriginW.x * this.zoomLevel, zoomOriginScr.y - zoomOriginW.y * this.zoomLevel);
        }
    }
    worldToScreen(coord) {
        return coord.scalarMul(this.zoomLevel).add(this.panOffset);
    }
    screenToWorld(coord) {
        return coord.sub(this.panOffset).scalarDiv(this.zoomLevel);
    }
    worldToScreenRect(rect) {
        return new Rect(rect.x * this.zoomLevel + this.panOffset.x, rect.y * this.zoomLevel + this.panOffset.y, rect.w * this.zoomLevel, rect.h * this.zoomLevel);
    }
}
