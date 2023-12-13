export class Point {
  constructor(readonly x: number, readonly y: number) {}
}

export class Rect {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly width: number,
    readonly height: number
  ) {}
}

export function pointRectIntersection(point: Point, rect: Rect) {
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
