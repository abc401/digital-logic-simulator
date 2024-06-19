import type { TutorialNav } from '@src/lib/stores/tutorials.js';
import { apiURL } from '@src/ts/api/helpers';

export interface MCQ {
	id: number;
	stmt: string;
	o1: string;
	o2: string;
	o3: string;
	o4: string;
	correctOption: number;
	articleID: number;
}

export async function load(ctx) {
	const id = ctx.params.tutorial_id;
	const res = await ctx.fetch(apiURL(`tutorials/${id}/quiz`));
	const json: {
		mcqs: MCQ[];
		tutorial: TutorialNav;
	} = await res.json();
	return {
		mcqs: json.mcqs,
		tutorial: json.tutorial
	};
}
