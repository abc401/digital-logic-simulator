// class Action {
//     constructor() {}
// 	undo() {}
// 	do() {}
// }

import { actionsManager } from '@src/routes/+page.svelte';

export interface UserAction {
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

		document.addEventListener('keydown', (ev) => {
			if (!ev.ctrlKey) {
				return;
			}
			if (ev.key.toLowerCase() == 'z' && ev.shiftKey) {
				this.redo();
				console.log('Redo');
			} else if (ev.key.toLowerCase() == 'z') {
				this.undo();
				console.log('Undo');
			}
		});
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

	do(action: UserAction) {
		this.push(action);
		action.do();
	}
}
// class ActionsManager {}
