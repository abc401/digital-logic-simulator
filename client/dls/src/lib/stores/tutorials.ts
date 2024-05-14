import { writable } from 'svelte/store';

export interface Tutorial {
	link_title: string;
	display_title: string;
	next: string | null;
	previous: string | null;
}

export let tutorials = writable<Tutorial[] | undefined>(undefined);
