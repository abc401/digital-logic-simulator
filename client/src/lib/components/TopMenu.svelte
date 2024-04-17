<script lang="ts">
	import { circuitInstanciators, icInstantiators } from '@src/lib/stores/circuitInstantiators';
	import { CreatingCircuit as CreatingCircuitMouse } from '@ts/interactivity/mouse/states/creating-circuit';
	import { CreatingCircuit as CreatingCircuitTouchScreen } from '@ts/interactivity/touchscreen/states/creating-circuit';
	import DropDown from './DropDown/DropDown.svelte';
	import DropDownToggle from './DropDown/DropDownToggle.svelte';
	import DropDownMenu, { DropDownPosition } from './DropDown/DropDownMenu.svelte';
	import DropDownItem from './DropDown/DropDownItem.svelte';
	import { getSM, simEngine } from '@src/routes/+page.svelte';
	import { integratedCircuits } from '../stores/integrated-circuits';
	import type { ID } from '@src/ts/scene/scene';
	import type { Circuit } from '@src/ts/scene/objects/circuits/circuit';
	import { simulation } from '../stores/simulation';

	function createCircuit(circuitName: string, instantiator: () => Circuit) {
		let [mouseSM, touchScreenSM] = getSM();
		console.log('Mouse State Machine:', mouseSM);
		if (mouseSM != null) {
			mouseSM.state = new CreatingCircuitMouse(circuitName, instantiator);
		}
		if (touchScreenSM != null) {
			touchScreenSM.state = new CreatingCircuitTouchScreen(circuitName, instantiator);
		}
	}
</script>

<div {...$$restProps}>
	<!-- <DropDown>
		<DropDownToggle>Add</DropDownToggle>
		<DropDownMenu> -->
	{#each Object.keys(circuitInstanciators) as category (category)}
		<DropDown>
			<DropDownToggle class="my-1 px-3 py-1.5 ">{category}</DropDownToggle>
			<DropDownMenu position={DropDownPosition.Below}>
				{#each Object.keys(circuitInstanciators[category]) as circuitName (circuitName)}
					<DropDownItem
						action={() => {
							createCircuit(circuitName, circuitInstanciators[category][circuitName]);
						}}>{circuitName}</DropDownItem
					>
				{/each}
			</DropDownMenu>
		</DropDown>
	{/each}
	<DropDown>
		<DropDownToggle class="my-1 px-3 py-1.5 ">Simulation</DropDownToggle>
		<DropDownMenu>
			<DropDownItem
				action={() => {
					simulation.setPaused(true);
				}}>Pause</DropDownItem
			>
			<DropDownItem
				action={() => {
					simEngine.runSim();
				}}>Play</DropDownItem
			>
			<DropDownItem
				action={() => {
					simEngine.step();
				}}>Step</DropDownItem
			>
		</DropDownMenu>
	</DropDown>

	{#if Object.entries($icInstantiators).length > 0}
		<DropDown>
			<DropDownToggle class="my-1 px-3 py-1.5 ">ICs</DropDownToggle>
			<DropDownMenu position={DropDownPosition.Below}>
				{#each Object.entries($icInstantiators) as [id, instantiator] (id)}
					<DropDownItem
						action={() => {
							createCircuit(integratedCircuits.getName(+id), instantiator);
							instantiator;
						}}>{integratedCircuits.getName(+id)}</DropDownItem
					>
				{/each}
			</DropDownMenu>
		</DropDown>
	{/if}
</div>
