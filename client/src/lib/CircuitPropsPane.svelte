<script lang="ts">
	// import type { Circuit } from '@ts/scene/objects/circuits/circuit';
	import { focusedCircuit } from '@lib/stores/focusedCircuit';
	import {
		CircuitPropType,
		defaultPropSetters,
		defaultPropTypes,
		getPropType
	} from '@ts/scene/objects/circuits/circuit';
	import BoolProp from './circuitProps/BoolProp.svelte';
	import NumberProp from './circuitProps/NumberProp.svelte';
	import StringProp from './circuitProps/StringProp.svelte';
	// import StringProp from './circuitProps/StringProp.Svelte';
	// import StringProp from './circuitProps/StringProp.svelte';

	// function getPropType(name: string) {
	// 	if ($focusedCircuit == null) {
	// 		throw Error();
	// 	}
	// 	let propType = $focusedCircuit.parentCircuit.propTypes[name];
	// 	if (propType == null) {
	// 		propType = defaultPropTypes[name];
	// 	}
	// 	if (propType == null) {
	// 		throw Error();
	// 	}
	// 	return propType;
	// }
</script>

<div>
	{#if $focusedCircuit != null}
		{#each Object.keys($focusedCircuit.parentCircuit.props) as name (name)}
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
		<div>No Circuit Selected</div>
	{/if}
</div>
