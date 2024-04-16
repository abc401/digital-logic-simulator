<script lang="ts">
	import { circuitProps } from '@src/lib/stores/focusedCircuit';
	import {
		CircuitPropType,
		type Circuit,
		getPropType,
		getPropSetter,
		setProp,
		type Props
	} from '@ts/scene/objects/circuits/circuit';

	export let name: string;
	export let circuit: Circuit;

	let props: Props | undefined;
	$: {
		props = $circuitProps;
		console.log('props updated: ', props);
	}
	let nameValue: string;
	$: {
		if (props == null) {
			throw Error();
		}

		nameValue = props[name];
		console.log('name value updated', nameValue);
		if (input != null) {
			input.value = nameValue;
		}
	}

	// $: {
	// 	if ($circuitProps == null) {
	// 		throw Error();
	// 	}
	// 	props = $circuitProps;
	// }

	if (getPropType(circuit, name) != CircuitPropType.String) {
		console.log(`circuit.propTypes[${name}] != CircuitPropType.String`);
		throw Error();
	}

	// let propSetter = getPropSetter(circuit, name);
	// circuitProps
	let input: HTMLInputElement | undefined;
</script>

{#if props != null}
	<label for={'prop-' + name} class="grid grid-cols-[min-content_minmax(0,1fr)] gap-3 px-4">
		<span class="capitalize">{name}</span>
		<input
			class="min-w-20 rounded-full bg-neutral-700 px-5 py-1 text-xs text-neutral-50 focus:bg-neutral-50 focus:text-neutral-950"
			bind:this={input}
			on:change={(ev) => {
				// const value = ev.currentTarget.value;
				if (input == null) {
					throw Error();
				}

				console.log('value: ', input.value);
				setProp(circuit, name, input.value);

				// propSetter(circuit, input.value);
				// if () {
				// 	console.log('value was invalid');
				if (props == null) {
					throw Error();
				}

				input.value = props[name];
				// 	return;
				// }
				// input.value = circuit.props[name];
				// console.log('value was valid');
				input.blur();
				// document.body.focus();
			}}
			type="text"
			value={nameValue}
			id={'prop-' + name}
		/>
	</label>
{/if}
