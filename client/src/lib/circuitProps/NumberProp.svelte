<script lang="ts">
	import { CircuitPropType, type Circuit } from '@ts/scene/objects/circuits/circuit';

	export let name: string;
	export let circuit: Circuit;

	if (circuit.propTypes[name] != CircuitPropType.NaturalNumber) {
		console.log('circuit.propTypes[name] != CircuitPropType.NaturalNumber');
		throw Error();
	}
</script>

<label for={'prop-' + name}>
	<span>{name}</span>
	<input
		on:change={(ev) => {
			if (!circuit.setProp(name, ev.currentTarget.value)) {
				ev.currentTarget.value = circuit.props[name];
			}
		}}
		type="number"
		{name}
		value={circuit.props[name]}
		id={'prop-' + name}
	/>
</label>
