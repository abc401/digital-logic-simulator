// import { sceneManager } from "./main.js";
// import { Circle } from './math.js';
import { Queue } from './data-structures/queue.js';
import type { Circuit } from './scene/objects/circuits/circuit.js';
import { sceneManager } from '@src/routes/dls/+page.svelte';
import { simulation } from '@lib/stores/simulation.js';

export class SimEvent {
	constructor(
		readonly self: any,
		readonly handeler: (self: any) => void
	) {}
}

export enum UpdationStrategy {
	InCurrentFrame = 'InCurrentFrame',
	InNextFrame = 'InNextFrame',
	Immediate = 'Immediate'
}

export class SimEngine {
	static fps = 60;

	// paused = true;

	currentFrameEvents: Queue<SimEvent> = new Queue();
	nextFrameEvents: Queue<SimEvent> = new Queue();

	recurringEvents: SimEvent[] = [];

	tickNumber: number = 0;

	async sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	step() {
		console.log('Tick start');

		this.tickNumber += 1;

		const tmp = this.currentFrameEvents;
		this.currentFrameEvents = this.nextFrameEvents;
		this.nextFrameEvents = tmp;

		console.debug('Current: ', this.currentFrameEvents);

		for (let i = 0; i < this.recurringEvents.length; i++) {
			this.recurringEvents[i].handeler(this.recurringEvents[i].self);
		}

		let event = this.currentFrameEvents.dequeue();
		while (event != null) {
			event.handeler(event.self);
			(event.self as Circuit).simFrameAllocated = false;
			event = this.currentFrameEvents.dequeue();
		}

		// draw(ctx);
		console.debug('Next: ', this.nextFrameEvents);
		console.log('tick end');
		console.log('Scene 1: ', sceneManager.scenes.get(1));
	}

	tick() {
		this.step();
		simulation.setPaused(true);
	}

	runSim() {
		simulation.setPaused(false);
		const callback = () => {
			this.step();
			if (simulation.get().paused) {
				return;
			}
			setTimeout(callback, 1000 / SimEngine.fps);
		};
		callback();
	}
}
