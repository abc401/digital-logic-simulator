<script lang="ts">
	// import type { Circuit } from '@ts/scene/objects/circuits/circuit';
	import { circuitProps, focusedCircuit } from '@stores/focusedCircuit';
	import { CircuitPropType, getPropType } from '@ts/scene/objects/circuits/circuit';
	import BoolProp from '@comps/CircuitProps/BoolProp.svelte';
	import NumberProp from '@comps/CircuitProps/NumberProp.svelte';
	import StringProp from '@comps/CircuitProps/StringProp.svelte';
</script>

<span class=" px-4 py-2 text-xs uppercase opacity-60">Props</span>
<div {...$$restProps}>
	{#if $circuitProps != null && $focusedCircuit != null}
		{#each Object.keys($circuitProps) as name (name)}
			{#if getPropType($focusedCircuit.parentCircuit, name) === CircuitPropType.Bool}
				<BoolProp {name} circuit={$focusedCircuit.parentCircuit} />
			{:else if getPropType($focusedCircuit.parentCircuit, name) === CircuitPropType.NaturalNumber}
				<NumberProp {name} circuit={$focusedCircuit.parentCircuit} />
			{:else if getPropType($focusedCircuit.parentCircuit, name) === CircuitPropType.String}
				<StringProp {name} circuit={$focusedCircuit.parentCircuit} />
			{/if}
			<!-- <datalist id={'datalist-' + name}>
				{#if prop.type === CircuitPropType.Bool}
					{#each validTrueValues as trueValue}
						<option value={trueValue}>{trueValue}</option>
					{/each}
					{#each validFalseValues as falseValue}
						<option value={falseValue}>{falseValue}</option>
					{/each}
				{/if}
			</datalist> -->
		{/each}
	{:else}
		<span class="px-4">No Circuit Selected</span>
	{/if}
</div>
