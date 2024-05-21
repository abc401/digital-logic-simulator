import { DUMMY_HOSTNAME, NoopUserAction } from './actions';

export interface UserAction {
	name: string;
	undo(): void;
	do(): void;
	hitDoEndpoint(): Promise<Response>;
	hitUndoEndpoint(): Promise<Response>;
	// hitDoEndpoint(): URL;
	// hitUndoEndpoint(): URL;
}

interface HistoryNode {
	previous: HistoryNode | undefined;
	next: HistoryNode | undefined;
	action: UserAction;
	unDone: boolean;
}

export class ActionsManager {
	startNode: HistoryNode = {
		action: new NoopUserAction(),
		next: undefined,
		previous: undefined,
		unDone: false
	};

	tmpHistory: UserAction[] = [];
	currentNode: HistoryNode;
	currentSaveState: HistoryNode;

	saveJobRunning = false;
	saveFileTimeOut: NodeJS.Timeout | undefined;

	constructor() {
		this.currentNode = this.startNode;
		this.currentSaveState = this.startNode;
	}

	push(action: UserAction) {
		for (const action of this.tmpHistory) {
			this.pushNoSave(action);
		}
		this.tmpHistory = [];

		this.pushNoSave(action);

		console.log('Push: ', action.name);
		this.saveFile();
	}

	commitTmpHistory() {
		for (const action of this.tmpHistory) {
			this.pushNoSave(action);
		}
		this.tmpHistory = [];
		this.saveFile();
	}

	pushTmp(action: UserAction) {
		this.tmpHistory.push(action);
	}

	pushNoSave(action: UserAction) {
		this.currentNode.next = {
			action,
			unDone: false,

			previous: this.currentNode,
			next: undefined
		};
		this.currentNode = this.currentNode.next;
	}

	undo() {
		if (this.currentNode.previous == null) {
			return false;
		}

		const currentAction = this.currentNode.action;
		currentAction.undo();
		this.currentNode.unDone = true;
		this.currentNode = this.currentNode.previous;

		console.log('Undo: ', currentAction.name);
		this.saveFile();
		return true;
	}

	redo() {
		if (this.currentNode.next == null) {
			return false;
		}

		this.currentNode = this.currentNode.next;

		const currentAction = this.currentNode.action;
		currentAction.do();
		this.currentNode.unDone = false;

		console.log('Do: ', currentAction.name);
		this.saveFile();
		return true;
	}

	do(action: UserAction) {
		action.do();
		this.push(action);
		console.log('Do: ', action.name);
		// console.trace();
	}

	async saveFile() {
		if (this.saveJobRunning) {
			console.log('[ActionsManager.saveFile] SaveFile job already running.');
			return;
		}
		if (this.saveFileTimeOut != null) {
			clearTimeout(this.saveFileTimeOut);
			console.log('[ActionsManager.saveFile] Cleared timeout');
		}

		if (this.currentNode === this.currentSaveState) {
			console.log('[ActionsManager.saveFile] Server already up to date.');
			// this.saveFileTimeOut = setTimeout(() => this.saveFile(), 5 * 1000);
			return;
		}

		this.saveJobRunning = true;

		const getNextSaveState = (currentSaveState: HistoryNode) => {
			if (currentSaveState.unDone) {
				if (currentSaveState.previous == null) {
					throw Error();
				}
				return currentSaveState.previous;
			} else {
				if (currentSaveState.next == null) {
					throw Error();
				}
				return currentSaveState.next;
			}
		};

		while (this.currentSaveState !== this.currentNode) {
			let res: Response;

			let action: UserAction;
			if (this.currentSaveState.unDone) {
				action = this.currentSaveState.action;
			} else {
				if (this.currentSaveState.next == null) {
					throw Error();
				}
				action = this.currentSaveState.next.action;
			}

			try {
				if (this.currentSaveState.unDone) {
					res = await action.hitUndoEndpoint();
				} else {
					res = await action.hitDoEndpoint();
				}
			} catch (e) {
				// TODO: Notify the user that saving the file has failed
				// 		 so that the user may manually retry saving the file
				console.log('Request failed: ', action);
				return;
			}

			console.log('Request Succeeded: ', action);
			const json = await res.json();
			console.log('Response.Body: ', json);
			console.log('Response: ', res);
			if (res.status !== 200) {
				this.saveJobRunning = false;
				throw Error('You did a fucky wucky');
			}

			this.currentSaveState = getNextSaveState(this.currentSaveState);
		}
		this.saveJobRunning = false;
		// this.saveFileTimeOut = setTimeout(() => this.saveFile(), 5 * 1000);
	}
	lastTmpAction() {
		if (this.tmpHistory.length <= 0) {
			return undefined;
		}
		return this.tmpHistory[this.tmpHistory.length - 1];
	}
}
