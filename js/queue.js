var Queue = /** @class */ (function () {
    function Queue() {
        this.items = new Array();
        this.head = 0;
        this.tail = 0;
    }
    Queue.prototype.resize = function (newSize) {
        var newItems = new Array(newSize);
        for (var newIdx = 0, oldIdx = this.head; newIdx < this.items.length; newIdx++, oldIdx = (oldIdx + 1) % this.items.length) {
            newItems[newIdx] = this.items[oldIdx];
        }
        this.head = 0;
        this.tail = this.items.length;
    };
    Queue.prototype.enqueue = function (item) {
        if (this.isFull()) {
            this.resize(this.items.length * 2);
        }
        this.items[this.tail] = item;
        this.tail = (this.tail + 1) % this.items.length;
    };
    Queue.prototype.dequeue = function () {
        if (this.isEmpty()) {
            return undefined;
        }
        var result = this.items[this.head];
        this.head = (this.head + 1) % this.items.length;
        return result;
    };
    Queue.prototype.isFull = function () {
        return (this.tail + 1) % this.items.length === this.head;
    };
    Queue.prototype.isEmpty = function () {
        return this.head == this.tail;
    };
    return Queue;
}());
export { Queue };
