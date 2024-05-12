<script>
	import TabContent from '@src/lib/components/Tabs/TabContent.svelte';
	import TabToggle from '@src/lib/components/Tabs/TabToggle.svelte';
	import TabsContainer from '@src/lib/components/Tabs/TabsContainer.svelte';

	let tab1 = Symbol();
	let tab2 = Symbol();
</script>

<TabsContainer>
	<div>
		<TabToggle tabID={tab1}>Tab1 Toggle</TabToggle>
		<TabToggle tabID={tab2}>Tab2 Toggle</TabToggle>
	</div>
	<div>
		<TabContent tabID={tab1}>Tab1 Content</TabContent>
		<TabContent tabID={tab2}>Tab2 Content</TabContent>
	</div>
</TabsContainer>
