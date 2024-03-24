import { writable } from 'svelte/store';

let { subscribe, set, update } = writable('');

export function domLog(message: string) {
	update((value) => value + `${message}<br>`);
}

export let logs = {
	subscribe
};

let { subscribe: csSubscribe, set: csSet, update: csUpdate } = writable('');

export let canvasState = {
	subscribe: csSubscribe
};

export function logState(state: string) {
	csSet(state);
}
