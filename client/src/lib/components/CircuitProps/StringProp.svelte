<script lang="ts">
	import {
		CircuitPropType,
		type Circuit,
		getPropType,
		getPropSetter
	} from '@ts/scene/objects/circuits/circuit';

	export let name: string;
	export let circuit: Circuit;

	if (getPropType(circuit, name) != CircuitPropType.String) {
		console.log(`circuit.propTypes[${name}] != CircuitPropType.String`);
		throw Error();
	}

	let propSetter = getPropSetter(circuit, name);
</script>

<label for={'prop-' + name} class="grid grid-cols-[min-content_minmax(0,1fr)] gap-3 px-4">
	<span class="capitalize">{name}</span>
	<input
		class="min-w-20 rounded-full bg-neutral-700 px-5 py-1 text-xs text-neutral-50 focus:bg-neutral-50 focus:text-neutral-950"
		on:input={(ev) => {
			const value = ev.currentTarget.value;
			console.log('value: ', value);
			if (!propSetter(circuit, value.trim())) {
				console.log('value was invalid');
				ev.currentTarget.value = circuit.props[name];
				return;
			}
			console.log('value was valid');
		}}
		type="text"
		value={circuit.props[name]}
		id={'prop-' + name}
	/>
</label>
