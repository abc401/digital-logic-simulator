// class Action {
//     constructor() {}
// 	undo() {}
// 	do() {}
// }

interface Action {
	undo(): void;
	do(): void;
}

class HistoryNode {
	next: HistoryNode | undefined;
	constructor(
		public action: Action,
		public prev: HistoryNode | undefined = undefined
	) {}
}

export class ActionsManager {
	startNode: HistoryNode | undefined;
	currentNode: HistoryNode | undefined;

	constructor() {
		this.startNode = undefined;
		this.currentNode = undefined;
	}

	undo() {
		if (this.currentNode == null) {
			return false;
		}
		this.currentNode.action.undo();
		if (this.currentNode.prev != null) {
			this.currentNode = this.currentNode.prev;
		} else {
			this.currentNode = undefined;
		}
		return true;
	}

	redo() {
		if (this.startNode == null) {
			return false;
		}

		if (this.currentNode != null) {
			if (this.currentNode.next == null) {
				return false;
			}
			this.currentNode = this.currentNode.next;
		} else {
			this.currentNode = this.startNode;
		}

		this.currentNode.action.do();
		return true;
	}

	do(action: Action) {
		const node = new HistoryNode(action, this.currentNode);
		if (this.startNode == null || this.currentNode == null) {
			this.startNode = node;
			this.currentNode = node;
		} else {
			this.currentNode.next = node;
			this.currentNode = this.currentNode.next;
		}
		action.do();
	}
}
// class ActionsManager {}
