<script context="module" lang="ts">
	import { rootDiv } from '@src/routes/+page.svelte';

	let isResizing = false;
	let minWidth = 0;
	// let containerDiv: HTMLDivElement;
	let contentDiv: HTMLElement;
	let widthTransitionThresholdpx = 5;
	let isRetracted = true;

	export function configResizing(resizer: HTMLElement) {
		if (resizer == null) {
			console.log('resizer == null');
		}
		if (contentDiv == null) {
			throw Error();
		}

		let minWidthStr = getComputedStyle(document.body).getPropertyValue('--side-bar-min-width');
		console.log('min w str: ', minWidthStr);
		// remove the 'px' from the value
		minWidth = +minWidthStr.slice(0, minWidthStr.length - 2);
		console.log('min width: ', minWidth);

		console.log('abcdef');
		resizer.addEventListener('mousedown', () => {
			startResizing();
		});

		document.addEventListener('mouseup', () => {
			stopResizing();
		});

		document.addEventListener('mousemove', (ev) => {
			resize(ev);
		});
	}

	function startResizing() {
		isResizing = true;
		document.body.style.cursor = 'e-resize';
		rootDiv.style.pointerEvents = 'none';
		console.log('cursor: ', document.body.style.cursor);
	}

	function resize(ev: MouseEvent) {
		if (!isResizing) {
			return;
		}

		let mouseX = ev.clientX;

		const boundingRect = contentDiv.getBoundingClientRect();
		let newWidth = mouseX - boundingRect.x;

		if (newWidth < minWidth && newWidth > widthTransitionThresholdpx) {
			newWidth = minWidth;
		}

		if (newWidth <= widthTransitionThresholdpx) {
			newWidth = 0;
		}

		document.body.style.setProperty('--side-bar-width', `${newWidth}px`);
		console.log('new width: ', newWidth);
		contentDiv.scrollLeft = 0;
		ev.preventDefault();
	}

	function stopResizing() {
		isResizing = false;
		rootDiv.style.pointerEvents = 'auto';
		document.body.style.cursor = 'auto';
	}
</script>

<script lang="ts">
	import CircuitPropsPane from './CircuitPropsPane.svelte';
	import IntegratedCircuitsPane from './IntegratedCircuitsPane.svelte';
	import TabContent from './Tabs/TabContent.svelte';
	import TabToggle from './Tabs/TabToggle.svelte';
	import TabsContainer from './Tabs/TabsContainer.svelte';
	import { onMount } from 'svelte';

	const icsPaneID = Symbol();
	const propsPaneID = Symbol();

	let resizer: HTMLDivElement;

	onMount(() => {
		configResizing(resizer);
	});
</script>

<TabsContainer>
	<div
		bind:this={contentDiv}
		class="col-start-2 row-start-1 row-end-[-1] grid h-full grid-cols-1 grid-rows-subgrid overflow-auto border"
	>
		<TabContent
			class="grid w-full grid-rows-[min-content_minmax(0,1fr)_min-content] gap-2 overflow-auto"
			tabID={icsPaneID}
		>
			<IntegratedCircuitsPane />
		</TabContent>
		<TabContent tabID={propsPaneID}><CircuitPropsPane /></TabContent>
	</div>
	<div class="col-start-1 row-start-1 row-end-[-1] h-full overflow-auto">
		<TabToggle tabID={icsPaneID}>ICS</TabToggle>
		<TabToggle tabID={propsPaneID}>Props</TabToggle>
	</div>
</TabsContainer>

<div class="relative z-50 col-start-3 row-start-1 row-end-[-1] h-full w-full">
	<div
		bind:this={resizer}
		class="pointer-events-auto h-full w-full cursor-e-resize hover:bg-[var(--ornament-color)] hover:transition-colors hover:delay-100"
	></div>
</div>
