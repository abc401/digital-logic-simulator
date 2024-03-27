<script lang="ts">
	import type { Circuit } from '@ts/scene/objects/circuits/circuit';
	import { mostRecentlySelectedCircuit } from '@lib/stores/mostRecentlySelectedCircuit';
</script>

<div>
	{#if $mostRecentlySelectedCircuit != null}
		{#each $mostRecentlySelectedCircuit.parentCircuit.props as [name, prop]}
			<div>{name}</div>
			<div>{prop.type}</div>
			<div>{prop.value}</div>
		{/each}
	{:else}
		<div>No Circuit Selected</div>
	{/if}
</div>
