<script lang="ts">
	import {
		CircuitPropType,
		type Circuit,
		getPropType,
		getPropSetter
	} from '@ts/scene/objects/circuits/circuit';

	export let name: string;
	export let circuit: Circuit;

	if (getPropType(circuit, name) != CircuitPropType.NaturalNumber) {
		console.log('circuit.propTypes[name] != CircuitPropType.NaturalNumber');
		throw Error('circuit.propTypes[name] != CircuitPropType.NaturalNumber');
	}
	let propSetter = getPropSetter(circuit, name);

	let value = circuit.props[name];
	$: {
		if (!propSetter(circuit, value)) {
			value = circuit.props[name];
		}
	}
</script>

<label for={'prop-' + name} class="grid grid-cols-[min-content_minmax(0,1fr)] gap-3 px-4">
	<span>{name}</span>
	<div
		class="grid min-w-20 grid-cols-[min-content_minmax(2rem,1fr)_min-content] justify-center gap-2"
	>
		<button
			on:click={() => {
				const num = +value;
				value = `${num - 1}`;
			}}
			class="material-symbols-outlined | hover:bg-neutral-700 active:bg-neutral-500"
			>expand_more</button
		>
		<input
			class="rounded-full bg-neutral-700 px-3 text-center text-neutral-50 focus:bg-neutral-50 focus:text-neutral-950"
			on:change={(ev) => {}}
			type="text"
			bind:value
			id={'prop-' + name}
		/>
		<button
			on:click={() => {
				const num = +value;
				value = `${num + 1}`;
			}}
			class="material-symbols-outlined | hover:bg-neutral-700 active:bg-neutral-500"
			>expand_less</button
		>
	</div>
</label>
