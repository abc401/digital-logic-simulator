<script lang="ts">
	import { mouseStateMachine, touchScreenStateMachine } from '@routes/+page.svelte';
	import { circuitCreators } from '@stores/circuitCreators';
	import { currentScene } from '@ts/scene/scene';
	import { CreatingCircuit as CreatingCircuitMouse } from '@ts/interactivity/mouse/states/creating-circuit';
	import { CreatingCircuit as CreatingCircuitTouchScreen } from '@ts/interactivity/touchscreen/states/creating-circuit';
	import Menu from './DropDown/DropDown.svelte';
	import MenuItem from './DropDown/DropDownItem.svelte';
	import MenuItemExpandable from './DropDown/DropDownMenu.svelte';
	const menu: any = {
		File: {
			Open: undefined,
			Import: undefined,
			Export: undefined,
			'Export as': {
				JPEG: undefined,
				SVG: undefined
			},
			Quit: undefined
		},
		Edit: {
			Copy: undefined,
			Paste: undefined,
			Delete: undefined
		},
		Add: $circuitCreators
	};
</script>
