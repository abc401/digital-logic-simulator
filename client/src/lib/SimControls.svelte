<script>
	import { simEngine } from '@routes/+page.svelte';
	import { simulation } from './stores/simulation';
</script>

<div
	class="fixed bottom-0 left-1/2 grid -translate-x-1/2 grid-flow-col justify-center rounded-lg border border-neutral-700 px-2"
>
	{#if $simulation.paused}
		<button
			class="material-symbols-outlined | p-1 hover:bg-neutral-700 active:bg-neutral-500"
			on:click={() => {
				simEngine.runSim();
			}}
		>
			play_arrow
		</button>
	{:else}
		<button
			class="material-symbols-outlined | p-1 hover:bg-neutral-700 active:bg-neutral-500"
			on:click={() => {
				simulation.setPaused(true);
			}}
		>
			pause
		</button>
	{/if}
	<button
		class="material-symbols-outlined | p-1 hover:bg-neutral-700 active:bg-neutral-500"
		on:click={() => {
			simEngine.tick();
		}}
	>
		skip_next
	</button>
	<button class="material-symbols-outlined | p-1 text-base opacity-50">drag_indicator</button>
</div>
