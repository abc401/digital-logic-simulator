import { writable } from 'svelte/store';

let { subscribe, set, update } = writable({
	paused: true
});

export let simulation = {
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
