<script lang="ts">
	import {
		CircuitPropType,
		type Circuit,
		type PropSetter,
		defaultPropSetters,
		getPropType,
		getPropSetter
	} from '@ts/scene/objects/circuits/circuit';

	export let name: string;
	export let circuit: Circuit;

	if (getPropType(circuit, name) != CircuitPropType.Bool) {
		console.log('[BoolProp] circuit.propTypes[name] != CircuitPropType.Bool');
		throw Error();
	}
	let propSetter = getPropSetter(circuit, name);
</script>

<label for={'prop-' + name}>
	<span>{name}</span>
	<input
		on:change={(ev) => {
			if (!propSetter(circuit, ev.currentTarget.checked)) {
				ev.currentTarget.checked = circuit.props[name];
			}
		}}
		type="checkbox"
		checked={circuit.props[name]}
		id={'prop-' + name}
	/>
</label>
