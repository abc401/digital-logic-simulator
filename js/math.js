var Vec2 = /** @class */ (function () {
    function Vec2(x, y) {
        this.x = x;
        this.y = y;
    }
    Vec2.prototype.add = function (other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    };
    Vec2.prototype.sub = function (other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    };
    Vec2.prototype.scalarMul = function (scalar) {
        return new Vec2(scalar * this.x, scalar * this.y);
    };
    Vec2.prototype.lerp = function (other, t) {
        return this.add(other.sub(this).scalarMul(t));
    };
    return Vec2;
}());
export { Vec2 };
var Rect = /** @class */ (function () {
    function Rect(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    Rect.prototype.pos = function () {
        return new Vec2(this.x, this.y);
    };
    Rect.prototype.dim = function () {
        return new Vec2(this.width, this.height);
    };
    Rect.prototype.aspectRatio = function () {
        return this.width / this.height;
    };
    Rect.fromEndPoints = function (p1, p2) {
        return new Rect(p1.x > p2.x ? p2.x : p1.x, p1.y > p2.y ? p2.y : p1.y, Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
    };
    Rect.prototype.forceAspectRatio = function (aspectRatio) {
        return new Rect(this.x, this.y, this.width > this.height ? this.width : aspectRatio * this.height, this.width > this.height ? this.width / aspectRatio : this.height);
    };
    Rect.prototype.midPoint = function () {
        return new Vec2(this.x + this.width / 2, this.y + this.height / 2);
    };
    Rect.prototype.withMidPoint = function (midPoint) {
        return new Rect(midPoint.x - this.width / 2, midPoint.y - this.height / 2, this.width, this.height);
    };
    return Rect;
}());
export { Rect };
export function pointRectIntersection(point, rect) {
    if (point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height) {
        return true;
    }
    return false;
}
export function clamp(value, min, max) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}
