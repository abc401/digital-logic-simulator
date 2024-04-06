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

<label for={'prop-' + name}>
	<span>{name}</span>
	<input
		class="text-neutral-900"
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
