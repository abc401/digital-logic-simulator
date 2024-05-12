// class Action {
//     constructor() {}
// 	undo() {}
// 	do() {}
// }

export interface UserAction {
	name: string;
	undo(): void;
	do(): void;
}

class HistoryNode {
	next: HistoryNode | undefined;
	constructor(
		public action: UserAction,
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

	push(action: UserAction) {
		const node = new HistoryNode(action, this.currentNode);
		if (this.startNode == null || this.currentNode == null) {
			this.startNode = node;
			this.currentNode = node;
		} else {
			this.currentNode.next = node;
			this.currentNode = this.currentNode.next;
		}
		console.log('Push: ', this.currentNode.action.name);
	}

	undo() {
		if (this.currentNode == null) {
			return false;
		}
		this.currentNode.action.undo();
		console.log('Undo: ', this.currentNode.action.name);
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
		console.log('Do: ', this.currentNode.action.name);
		return true;
	}

	do(action: UserAction) {
		this.push(action);
		action.do();
		console.log('Do: ', action.name);
		console.trace();
	}
}
// class ActionsManager {}
