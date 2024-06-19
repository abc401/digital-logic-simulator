import { fetchProject } from '@src/ts/api/helpers.js';

export async function load(ctx) {
	const project = await fetchProject((url) => ctx.fetch(url));
	return {
		project
	};
}
