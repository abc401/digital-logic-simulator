<script lang="ts">
	import { circuitProps } from '@src/lib/stores/focusedCircuit';
	import {
		CircuitPropType,
		getPropType,
		setProp,
		type Circuit
	} from '@src/ts/scene/objects/circuits/circuit';

	export let name: string;
	export let circuit: Circuit;

	if (getPropType(circuit, name) != CircuitPropType.NaturalNumber) {
		console.log('circuit.propTypes[name] != CircuitPropType.NaturalNumber');
		throw Error('circuit.propTypes[name] != CircuitPropType.NaturalNumber');
	}
	// let propSetter = getPropSetter(circuit, name);

	$: {
		if ($circuitProps == null) {
			throw Error();
		}
		console.log('input value updated');

		if (input != null) {
			console.log('input value updated');
			input.value = $circuitProps[name];
		}
	}
	let input: HTMLInputElement | undefined;
</script>

{#if $circuitProps != null}
	<label for={'prop-' + name} class="grid grid-cols-[min-content_minmax(0,1fr)] gap-3 px-4">
		<span>{name}</span>
		<div
			class="grid min-w-20 grid-cols-[min-content_minmax(2rem,1fr)_min-content] justify-center gap-2"
		>
			<button
				on:click={(ev) => {
					if (input == null || $circuitProps == null) {
						throw Error();
					}
					const num = +input.value;
					setProp(circuit, name, `${num - 1}`);
					input.value = $circuitProps[name];
				}}
				class="material-symbols-outlined | hover:bg-neutral-700 active:bg-neutral-500"
				>expand_more</button
			>
			<input
				class="rounded-full bg-neutral-700 px-3 text-center text-neutral-50 focus:bg-neutral-50 focus:text-neutral-950"
				bind:this={input}
				value={$circuitProps[name]}
				on:change={(ev) => {
					if (input == null || $circuitProps == null) {
						throw Error();
					}

					setProp(circuit, name, input.value);
					input.value = $circuitProps[name];
					// value = input.value;
					input.blur();
				}}
				type="text"
				id={'prop-' + name}
			/>
			<button
				on:click={(ev) => {
					if (input == null || $circuitProps == null) {
						throw Error();
					}
					const num = +input.value;
					setProp(circuit, name, `${num + 1}`);
					input.value = $circuitProps[name];
					// ev.currentTarget.blur();
				}}
				class="material-symbols-outlined | hover:bg-neutral-700 active:bg-neutral-500"
				>expand_less</button
			>
		</div>
	</label>
{/if}
