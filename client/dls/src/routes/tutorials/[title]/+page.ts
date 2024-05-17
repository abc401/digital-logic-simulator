import { currentTut, tutorialNav } from '@src/lib/stores/tutorials.js';
import { error } from '@sveltejs/kit';

export async function load(ctx) {
	const title = ctx.params.title;

	await tutorialNav.init((url) => ctx.fetch(url));
	const tutsNav = tutorialNav.get();

	if (tutsNav == null) {
		error(500);
	}

	const currentTut_ = tutsNav.find((value) => {
		return value.link_title === title;
	});
	if (currentTut_ == null) {
		error(404, 'Not Found');
	}

	await currentTut.set(title, (url) => ctx.fetch(url));
}
