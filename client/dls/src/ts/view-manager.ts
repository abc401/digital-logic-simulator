import { MAX_ZOOM, MIN_ZOOM } from './config.js';
import { Rect, Vec2, clamp } from './math.js';

export class View {
	zoomLevel: number;
	panOffset: Vec2;

	constructor() {
		this.zoomLevel = 1;
		this.panOffset = new Vec2(0, 0);
	}

	clone() {
		const view = new View();
		view.zoomLevel = this.zoomLevel;
		view.panOffset = this.panOffset;
		return view;
	}

	setView(view: View) {
		this.zoomLevel = view.zoomLevel;
		this.panOffset = view.panOffset;
	}
	setViewFromMembers(zoomLevel: number, panOffset: Vec2) {
		this.zoomLevel = zoomLevel;
		this.panOffset = panOffset;
		return this;
	}

	pan(amountScr: Vec2) {
		this.panOffset = this.panOffset.add(amountScr);
	}

	zoom(zoomOriginScr: Vec2, newZoomLevel: number) {
		newZoomLevel = clamp(newZoomLevel, MIN_ZOOM, MAX_ZOOM);

		if (this.zoomLevel !== newZoomLevel) {
			const zoomOriginW = this.screenToWorld(zoomOriginScr);
			this.zoomLevel = newZoomLevel;

			this.panOffset = new Vec2(
				zoomOriginScr.x - zoomOriginW.x * this.zoomLevel,
				zoomOriginScr.y - zoomOriginW.y * this.zoomLevel
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
