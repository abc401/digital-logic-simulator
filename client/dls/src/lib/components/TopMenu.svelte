<script lang="ts">
	import { circuitInstantiators, icInstantiators } from '@src/lib/stores/circuitInstantiators';
	import { CreatingCircuit as CreatingCircuitMouse } from '@ts/interactivity/mouse/states/creating-circuit';
	import { CreatingCircuit as CreatingCircuitTouchScreen } from '@ts/interactivity/touchscreen/states/creating-circuit';
	import DropDown from './DropDown/DropDown.svelte';
	import DropDownToggle from './DropDown/DropDownToggle.svelte';
	import DropDownMenu, { DropDownPosition } from './DropDown/DropDownMenu.svelte';
	import DropDownItem from './DropDown/DropDownItem.svelte';
	import { actionsManager, getSM, sceneManager, simEngine } from '@src/routes/dls/+page.svelte';
	import { integratedCircuits } from '../stores/integrated-circuits';
	import type { Circuit } from '@src/ts/scene/objects/circuits/circuit';
	import { simulation } from '../stores/simulation';
	import { exportToFile } from '@src/ts/helpers';
	import { currentScene } from '@stores/currentScene';

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
	$: currentScene_ = $currentScene;
</script>

<div {...$$restProps}>
	<DropDown>
		<DropDownToggle class="my-1 px-3 py-1.5 ">File</DropDownToggle>
		<DropDownMenu>
			<DropDownItem
				action={() => {
					const currentScene = sceneManager.getCurrentScene();
					if (currentScene == null) {
						throw Error();
					}

					const svg = currentScene.drawSvg();

					const file = new Blob([svg]);
					exportToFile(file, `${currentScene.name}.svg`);
				}}>Export To SVG</DropDownItem
			>
		</DropDownMenu>
	</DropDown>
	<DropDown>
		<DropDownToggle class="my-1 px-3 py-1.5 ">Add</DropDownToggle>
		<DropDownMenu position={DropDownPosition.Below}>
			{#each Object.keys(circuitInstantiators) as circuitName (circuitName)}
				<DropDownItem
					action={() => {
						createCircuit(circuitName, circuitInstantiators[circuitName]);
					}}>{circuitName}</DropDownItem
				>
			{/each}
		</DropDownMenu>
	</DropDown>
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
	<DropDown>
		<DropDownToggle class="my-1 px-3 py-1.5 ">Edit</DropDownToggle>
		<DropDownMenu>
			<DropDownItem
				action={() => {
					actionsManager.undo();
					// simulation.setPaused(true);
				}}>Undo</DropDownItem
			>
			<DropDownItem
				action={() => {
					actionsManager.redo();
				}}>Redo</DropDownItem
			>
		</DropDownMenu>
	</DropDown>

	{#if Object.entries($icInstantiators).length > 0}
		<DropDown>
			<DropDownToggle class="my-1 px-3 py-1.5 ">ICs</DropDownToggle>
			<DropDownMenu position={DropDownPosition.Below}>
				{#each Object.entries($icInstantiators) as [id, instantiator] (id)}
					{#if +id !== currentScene_?.id}
						<DropDownItem
							action={() => {
								createCircuit(integratedCircuits.getName(+id), instantiator);
								instantiator;
							}}>{integratedCircuits.getName(+id)}</DropDownItem
						>
					{/if}
				{/each}
			</DropDownMenu>
		</DropDown>
	{/if}
</div>
