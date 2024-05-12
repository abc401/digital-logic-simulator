<script lang="ts">
	import { circuitProps } from '@src/lib/stores/focusedCircuit';
	import {
		CircuitPropType,
		type Circuit,
		type PropSetter,
		defaultPropSetters,
		getPropType,
		getPropSetter,
		setProp
	} from '@ts/scene/objects/circuits/circuit';
	import clsx from 'clsx';

	export let name: string;
	export let circuit: Circuit;

	if (getPropType(circuit, name) != CircuitPropType.Bool) {
		console.log('[BoolProp] circuit.propTypes[name] != CircuitPropType.Bool');
		throw Error();
	}
	// let propSetter = getPropSetter(circuit, name);
	let button: HTMLButtonElement | undefined;
	let value: boolean;
	$: {
		if ($circuitProps == null) {
			throw Error();
		}
		value = $circuitProps[name];
	}
	$: {
		// console.log('Hello');
		// if (!propSetter(circuit, value)) {
		// 	value = circuit.props[name];
		// }
	}
</script>

{#if $circuitProps != null}
	<label
		for={'prop-' + name}
		class="grid grid-cols-[min-content_minmax(0,1fr)_auto] items-center gap-3 px-4"
	>
		<span class="capitalize">{name}</span>
		<button
			bind:this={button}
			class={clsx(
				'relative aspect-[6/1] h-[0.5rem] rounded-full  transition-colors duration-100 after:absolute  after:top-1/2 after:aspect-square after:h-[1.5rem] after:-translate-y-1/2 after:rounded-full after:transition-[transform,_left,_background-color] after:duration-100',
				{
					'bg-neutral-700 after:left-0 after:bg-neutral-50': !value,
					'bg-neutral-700 after:left-full after:-translate-x-full after:bg-neutral-50': value
				}
			)}
			on:click={() => {
				if (button == null || $circuitProps == null) {
					throw Error();
				}

				setProp(circuit, name, !value);

				value = $circuitProps[name];
			}}
		></button>
	</label>
{/if}
