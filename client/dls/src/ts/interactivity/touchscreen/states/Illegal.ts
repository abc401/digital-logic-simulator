import { logState } from '@lib/stores/debugging';
import {
	TouchAction,
	type TouchScreenState,
	TouchScreenStateMachine,
	discriminateTouches,
	getAppropriateState
} from '../state-machine';

export class Illegal implements TouchScreenState {
	constructor() {
		logState('Illegal');
	}
	update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
		const payload = action.payload;
		const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.touches);
		if (outsideOfCanvas.length > 0 || insideOfCanvas.length > 2) {
			return;
		}

		stateMachine.state = getAppropriateState(payload.touches);
	}
}
