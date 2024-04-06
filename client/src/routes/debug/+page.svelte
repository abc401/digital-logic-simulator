<script>
	import DropDown from '@comps/DropDown/DropDown.svelte';
	import DropDownItem from '@comps/DropDown/DropDownItem.svelte';
	import DropDownMenu from '@comps/DropDown/DropDownMenu.svelte';
	import DropDownToggle from '@comps/DropDown/DropDownToggle.svelte';
</script>

<DropDown>
	<DropDownToggle>Toggle</DropDownToggle>
	<DropDownMenu>
		<DropDownItem
			on:click={() => {
				alert('Item 1 Clicked');
			}}>Item 1</DropDownItem
		>
		<DropDown>
			<DropDownToggle>Item 2</DropDownToggle>
			<DropDownMenu>
				<DropDownItem>Hello 2</DropDownItem>
			</DropDownMenu>
		</DropDown>
		<DropDown>
			<DropDownToggle>Item 3</DropDownToggle>
			<DropDownMenu>
				<DropDownItem>Hello 3</DropDownItem>
			</DropDownMenu>
		</DropDown>
	</DropDownMenu>
</DropDown>
