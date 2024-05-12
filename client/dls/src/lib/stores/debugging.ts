import { writable } from 'svelte/store';

const { subscribe, update } = writable('');

export function domLog(message: string) {
	update((value) => value + `${message}<br>`);
}

export const logs = {
	subscribe
};

const { subscribe: csSubscribe, set: csSet } = writable('');

export const canvasState = {
	subscribe: csSubscribe
};

export function logState(state: string) {
	csSet(state);
}
