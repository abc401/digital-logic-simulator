class Node<T> {
	below: undefined | Node<T>;
	above: undefined | Node<T>;

	constructor(public data: T) {}
}

class TopToBottomIterator<T> implements Iterator<Node<T>> {
	currentTop: Node<T> | undefined;
	constructor(top: Node<T> | undefined) {
		this.currentTop = top;
	}

	next(): IteratorResult<Node<T>> {
		if (this.currentTop == null) {
			return { value: undefined, done: true };
		} else {
			const ret = this.currentTop;
			this.currentTop = this.currentTop.below;
			return { value: ret, done: false };
		}
	}

	[Symbol.iterator]() {
		return this;
	}
}

class BottomToTopIterator<T> implements Iterator<Node<T>> {
	currentBottom: Node<T> | undefined;

	constructor(bottom: Node<T> | undefined) {
		this.currentBottom = bottom;
	}

	next(): IteratorResult<Node<T>> {
		if (this.currentBottom == null) {
			return { value: undefined, done: true };
		} else {
			const ret = this.currentBottom;
			this.currentBottom = this.currentBottom.above;
			return { value: ret, done: false };
		}
	}

	[Symbol.iterator]() {
		return this;
	}
}

export class StackList<T> {
	private top: undefined | Node<T>;
	private bottom: undefined | Node<T>;

	private dataToNodeMapping: Map<T, Node<T>> = new Map();

	push(data: T) {
		if (this.top == null) {
			this.top = new Node(data);
			this.bottom = this.top;
		} else {
			const newTop = new Node(data);
			newTop.below = this.top;
			this.top.above = newTop;
			this.top = newTop;
		}
		this.dataToNodeMapping.set(data, this.top);
	}

	removeNode(node: Node<T>) {
		if (this.top === node) {
			this.top = node.below;
		}
		if (this.bottom === node) {
			this.bottom = node.above;
		}

		if (node.above != null) {
			node.above.below = node.below;
		}
		if (node.below != null) {
			node.below.above = node.above;
		}

		node.above = undefined;
		node.below = undefined;

		this.dataToNodeMapping.delete(node.data);
	}

	remove(data: T) {
		const node = this.dataToNodeMapping.get(data);
		if (node == null) {
			return false;
		}
		this.removeNode(node);
		return true;
	}

	topToBottom() {
		return new TopToBottomIterator(this.top);
	}

	bottomToTop() {
		return new BottomToTopIterator(this.bottom);
	}
}
