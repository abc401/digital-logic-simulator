<script lang="ts">
	import { circuitInstanciators } from '@stores/circuitCreators';
	import { CreatingCircuit as CreatingCircuitMouse } from '@ts/interactivity/mouse/states/creating-circuit';
	import { CreatingCircuit as CreatingCircuitTouchScreen } from '@ts/interactivity/touchscreen/states/creating-circuit';
	import DropDown from './DropDown/DropDown.svelte';
	import DropDownToggle from './DropDown/DropDownToggle.svelte';
	import DropDownMenu, { DropDownPosition } from './DropDown/DropDownMenu.svelte';
	import DropDownItem from './DropDown/DropDownItem.svelte';
	import { getSM } from '@src/routes/+page.svelte';
</script>

<div {...$$restProps}>
	<!-- <DropDown>
		<DropDownToggle>Add</DropDownToggle>
		<DropDownMenu> -->
	{#each Object.keys(circuitInstanciators) as category (category)}
		<DropDown>
			<DropDownToggle class="my-1 px-3 py-1.5 ">{category}</DropDownToggle>
			<DropDownMenu position={DropDownPosition.Below}>
				<!-- <DropDown>
					<DropDownToggle
						class="w-full bg-neutral-800 p-2 [text-align:inherit] hover:bg-neutral-700 active:bg-neutral-500"
						>Hello</DropDownToggle
					>
					<DropDownMenu>
						<DropDownItem>Hello Again</DropDownItem>
					</DropDownMenu>
				</DropDown> -->
				{#each Object.keys(circuitInstanciators[category]) as circuitName (circuitName)}
					<DropDownItem
						action={() => {
							let [mouseSM, touchScreenSM] = getSM();
							console.log('Mouse State Machine:', mouseSM);
							if (mouseSM != null) {
								mouseSM.state = new CreatingCircuitMouse(
									circuitName,
									circuitInstanciators[category][circuitName]
								);
							}
							if (touchScreenSM != null) {
								touchScreenSM.state = new CreatingCircuitTouchScreen(
									circuitName,
									circuitInstanciators[category][circuitName]
								);
							}
						}}>{circuitName}</DropDownItem
					>
				{/each}
			</DropDownMenu>
		</DropDown>
	{/each}
	<!-- </DropDownMenu>
	</DropDown> -->
</div>
