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
</script>

<label for={'prop-' + name}>
	<span>{name}</span>
	<input
		class="text-neutral-900"
		on:change={(ev) => {
			if (!propSetter(circuit, ev.currentTarget.value)) {
				ev.currentTarget.value = circuit.props[name];
			}
		}}
		type="number"
		value={circuit.props[name]}
		id={'prop-' + name}
	/>
</label>
