export interface BoundingBox {
	pointIntersection(point: Vec2): boolean;
}

export class Vec2 {
	constructor(
		readonly x: number,
		readonly y: number
	) {}

	clone() {
		return new Vec2(this.x, this.y);
	}
	eq(other: Vec2) {
		return this.x === other.x && this.y === other.y;
	}
	add(other: Vec2) {
		return new Vec2(this.x + other.x, this.y + other.y);
	}

	sub(other: Vec2) {
		return new Vec2(this.x - other.x, this.y - other.y);
	}

	scalarMul(scalar: number) {
		return new Vec2(this.x * scalar, this.y * scalar);
	}

	scalarDiv(scalar: number) {
		return new Vec2(this.x / scalar, this.y / scalar);
	}

	lerp(other: Vec2, t: number) {
		return this.add(other.sub(this).scalarMul(t));
	}

	mag() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	neg() {
		return new Vec2(-this.x, -this.y);
	}
	isZero() {
		return this.x === 0 && this.y === 0;
	}
}

export class Circle implements BoundingBox {
	constructor(
		public getLoc: () => Vec2,
		public radius: number
	) {}

	pointIntersection(point: Vec2): boolean {
		return point.sub(this.getLoc()).mag() < this.radius;
	}
}

export class Rect implements BoundingBox {
	constructor(
		public x: number,
		public y: number,
		public w: number,
		public h: number
	) {}

	get xy() {
		return new Vec2(this.x, this.y);
	}

	get wh() {
		return new Vec2(this.w, this.h);
	}

	set xy(xy: Vec2) {
		this.x = xy.x;
		this.y = xy.y;
	}

	aspectRatio() {
		return this.w / this.h;
	}

	static fromEndPoints(p1: Vec2, p2: Vec2) {
		return new Rect(
			p1.x > p2.x ? p2.x : p1.x,
			p1.y > p2.y ? p2.y : p1.y,
			Math.abs(p1.x - p2.x),
			Math.abs(p1.y - p2.y)
		);
	}

	clone() {
		return new Rect(this.x, this.y, this.w, this.h);
	}

	forceAspectRatio(aspectRatio: number) {
		return new Rect(
			this.x,
			this.y,
			this.w > this.h ? this.w : aspectRatio * this.h,
			this.w > this.h ? this.w / aspectRatio : this.h
		);
	}

	midPoint() {
		return new Vec2(this.x + this.w / 2, this.y + this.h / 2);
	}

	withMidPoint(midPoint: Vec2) {
		return new Rect(midPoint.x - this.w / 2, midPoint.y - this.h / 2, this.w, this.h);
	}

	pointIntersection(point: Vec2): boolean {
		if (
			point.x >= this.x &&
			point.x <= this.x + this.w &&
			point.y >= this.y &&
			point.y <= this.y + this.h
		) {
			return true;
		}
		return false;
	}
}

export function clamp(value: number, min: number, max: number) {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}
