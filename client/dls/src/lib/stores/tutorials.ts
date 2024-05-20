import { apiURL } from '@src/ts/api';
import { writable, type Invalidator, type Subscriber, type Unsubscriber } from 'svelte/store';

type FetchFunc = (url: URL) => Promise<Response>;
export interface TutorialNav {
	link_title: string;
	display_title: string;
	next: string | null;
	previous: string | null;
}

export interface Tutorial {
	link_title: string;
	display_title: string;
	next: string | null;
	previous: string | null;
	content: string;
}

export let tutorialNav: {
	init(fetch: FetchFunc): Promise<void>;
	get(): TutorialNav[] | undefined;
};

{
	const { set, subscribe } = writable<TutorialNav[] | undefined>();
	tutorialNav = {
		async init(fetch: (url: URL) => Promise<Response>) {
			if (this.get() != null) {
				return;
			}

			const url = apiURL('tutorials/nav');
			const res = await fetch(url);
			const tutsVal = await res.json();
			set(tutsVal);
		},
		get() {
			let tutsVal: TutorialNav[] | undefined = undefined;
			const unsub = subscribe((value) => {
				tutsVal = value;
			});
			unsub();
			return tutsVal;
		}
	};
}
// export const currentTut = writable<Tutorial | undefined>(undefined);
export let currentTut: {
	set(link_id: string, fetch: FetchFunc): Promise<void>;
	get(): Tutorial | undefined;
	subscribe: (
		this: void,
		run: Subscriber<Tutorial | undefined>,
		invalidate?: Invalidator<Tutorial | undefined> | undefined
	) => Unsubscriber;
};
{
	const { set, subscribe } = writable<Tutorial | undefined>();
	currentTut = {
		subscribe,
		async set(link_id: string, fetch: FetchFunc) {
			const url = apiURL(`/tutorials/${link_id}`);
			const res = await fetch(url);
			const tut: Tutorial = await res.json();
			// console.log(tut);
			set(tut);
		},
		get() {
			let val: TutorialNav | undefined = undefined;
			const unsub = subscribe((value) => {
				val = value;
			});
			unsub();
			return val;
		}
	};
}
