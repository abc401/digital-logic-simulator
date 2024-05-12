<script context="module" lang="ts">
	import { tutorials, type Tutorial } from '@src/lib/stores/tutorials';

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
			throw Error();
		}
		const currentTut = tutsVal.find((value) => {
			return value.link_title === title;
		});
		console.log('currentTut: ', currentTut);
		if (currentTut == null) {
			return {
				status: 404,
				error: 'not found'
			};
		}
	}
</script>

<div></div>
