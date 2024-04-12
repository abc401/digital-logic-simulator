import { writable } from 'svelte/store';

const { subscribe, update } = writable({
	paused: true
});

export const simulation = {
	subscribe,

	get: function () {
		let sim = { paused: false };

		const unsubscribe = subscribe((value) => {
			sim = value;
		});
		unsubscribe();
		return sim;
	},

	setPaused: function (paused: boolean) {
		update((value) => {
			value.paused = paused;
			return value;
		});
	}
};
