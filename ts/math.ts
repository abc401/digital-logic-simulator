export class Vec2 {
  constructor(readonly x: number, readonly y: number) {}

  add(other: Vec2) {
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  sub(other: Vec2) {
    return new Vec2(this.x - other.x, this.y - other.y);
  }

  scalarMul(scalar: number) {
    return new Vec2(scalar * this.x, scalar * this.y);
  }

  lerp(other: Vec2, t: number) {
    return this.add(other.sub(this).scalarMul(t));
  }
}

export class Rect {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly width: number,
    readonly height: number
  ) {}

  pos() {
    return new Vec2(this.x, this.y);
  }

  dim() {
    return new Vec2(this.width, this.height);
  }

  aspectRatio() {
    return this.width / this.height;
  }

  static fromEndPoints(p1: Vec2, p2: Vec2) {
    return new Rect(
      p1.x > p2.x ? p2.x : p1.x,
      p1.y > p2.y ? p2.y : p1.y,
      Math.abs(p1.x - p2.x),
      Math.abs(p1.y - p2.y)
    );
  }

  forceAspectRatio(aspectRatio: number) {
    return new Rect(
      this.x,
      this.y,
      this.width > this.height ? this.width : aspectRatio * this.height,
      this.width > this.height ? this.width / aspectRatio : this.height
    );
  }

  midPoint() {
    return new Vec2(this.x + this.width / 2, this.y + this.height / 2);
  }

  withMidPoint(midPoint: Vec2) {
    return new Rect(
      midPoint.x - this.width / 2,
      midPoint.y - this.height / 2,
      this.width,
      this.height
    );
  }
}

export function pointRectIntersection(point: Vec2, rect: Rect) {
  if (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  ) {
    return true;
  }
  return false;
}

export function clamp(value: number, min: number, max: number) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
