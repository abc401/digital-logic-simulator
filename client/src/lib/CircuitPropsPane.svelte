<script lang="ts">
	// import type { Circuit } from '@ts/scene/objects/circuits/circuit';
	import { focusedCircuit } from '@lib/stores/mostRecentlySelectedCircuit';
	import { CircuitPropType } from '@ts/scene/objects/circuits/circuit';
	import BoolProp from './circuitProps/BoolProp.svelte';
	import NumberProp from './circuitProps/NumberProp.svelte';

	type OnSubmitEvent = SubmitEvent & {
		currentTarget: EventTarget & HTMLFormElement;
	};

	function onSubmit(ev: OnSubmitEvent, name: string) {
		let formData = new FormData(ev.currentTarget);
		let value = formData.get(name);
		if (value == null) {
			return;
		}
		if ($focusedCircuit == null) {
			throw Error();
		}
	}
</script>

<div>
	{#if $focusedCircuit != null}
		{#each Object.keys($focusedCircuit.parentCircuit.props) as name (name)}
			{#if $focusedCircuit.parentCircuit.propTypes[name] === CircuitPropType.Bool}
				<BoolProp {name} circuit={$focusedCircuit.parentCircuit} />
			{:else if $focusedCircuit.parentCircuit.propTypes[name] === CircuitPropType.NaturalNumber}
				<NumberProp {name} circuit={$focusedCircuit.parentCircuit} />
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
		<div>No Circuit Selected</div>
	{/if}
</div>
