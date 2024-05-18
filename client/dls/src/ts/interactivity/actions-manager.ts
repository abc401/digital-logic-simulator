// class Action {
//     constructor() {}
// 	undo() {}
// 	do() {}
// }

export interface UserAction {
	name: string;
	undo(): void;
	do(): void;
	getApiURL(): URL;
}

class HistoryNode {
	next: HistoryNode | undefined;
	constructor(
		public action: UserAction,
		public prev: HistoryNode | undefined = undefined
	) {}
}

export class ActionsManager {
	history: UserAction[] = [];
	currentNode = -1;

	constructor() {}

	push(action: UserAction) {
		this.history.push(action);
		this.currentNode++;

		console.log('Push: ', action.name);
	}

	undo() {
		if (this.currentNode < 0) {
			return false;
		}
		const currentAction = this.history[this.currentNode];
		currentAction.undo();
		this.currentNode--;

		console.log('Undo: ', currentAction.name);
		return true;
	}

	redo() {
		if (this.history.length >= this.currentNode + 1) {
			return false;
		}
		const currentAction = this.history[this.currentNode];
		currentAction.do();
		this.currentNode++;

		console.log('Do: ', currentAction.name);
		return true;
	}

	do(action: UserAction) {
		this.push(action);
		action.do();
		console.log('Do: ', action.name);
		// console.trace();
	}
}
// class ActionsManager {}
