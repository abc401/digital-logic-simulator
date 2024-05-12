import { tutorials, type Tutorial } from '@src/lib/stores/tutorials.js';
import { error } from '@sveltejs/kit';

export async function load(ctx) {
	const title = ctx.params.title;
	let tutsVal: Tutorial[] | undefined = undefined;
	const unsub = tutorials.subscribe((value) => {
		tutsVal = value;
	});
	unsub();
	if (tutsVal == null) {
		const url = new URL('/api/tutorials/', import.meta.env.VITE_API_SERVER);
		const res = await ctx.fetch(url);
		tutsVal = await res.json();
		tutorials.set(tutsVal);
	}

	if (tutsVal == null) {
		error(500);
	}

	const currentTut = tutsVal.find((value) => {
		return value.link_title === title;
	});
	if (currentTut == null) {
		error(404, 'Not Found');
	}
}
