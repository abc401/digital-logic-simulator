<script lang="ts">
	import { CircuitPropType, type Circuit } from '@ts/scene/objects/circuits/circuit';

	export let name: string;
	export let circuit: Circuit;

	if (circuit.propTypes[name] != CircuitPropType.Bool) {
		console.log('[BoolProp] circuit.propTypes[name] != CircuitPropType.Bool');
		throw Error();
	}
</script>

<label for={'prop-' + name}>
	<span>{name}</span>
	<input
		on:change={(ev) => {
			if (!circuit.setProp(name, ev.currentTarget.checked)) {
				ev.currentTarget.checked = circuit.props[name];
			}
		}}
		type="checkbox"
		{name}
		checked={circuit.props[name]}
		id={'prop-' + name}
	/>
</label>
