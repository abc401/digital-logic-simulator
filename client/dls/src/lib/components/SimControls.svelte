<script lang="ts">
	import { simEngine } from '@src/routes/dls/+page.svelte';
	import { simulation } from '@stores/simulation';
</script>

<div {...$$restProps}>
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
