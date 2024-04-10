<script context="module" lang="ts">
	let isResizing = false;
	let minWidth = 0;
	let currentWidth: number;

	let contentDiv: HTMLElement;
	let widthTransitionThresholdpx = 5;
	let tabsContainerContext: TabsContainerContext;
</script>

<script lang="ts">
	import clsx from 'clsx';
	import CircuitPropsPane from './CircuitPropsPane.svelte';
	import IntegratedCircuitsPane from './IntegratedCircuitsPane.svelte';
	import TabContent from './Tabs/TabContent.svelte';
	import TabToggle from './Tabs/TabToggle.svelte';
	import TabsContainer, { TabsContainerContext } from './Tabs/TabsContainer.svelte';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	import { rootDiv } from '@src/routes/+page.svelte';

	let isRetracted = true;

	function configResizing(resizer: HTMLElement) {
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

		let currentWidthStr = getComputedStyle(document.body).getPropertyValue('--side-bar-width');
		currentWidth = +currentWidthStr.slice(0, currentWidthStr.length - 2);
		console.log('currentWidth: ', currentWidth);

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
		currentWidth = contentDiv.getBoundingClientRect().width;
		document.body.style.cursor = 'e-resize';
		rootDiv.style.pointerEvents = 'none';
		console.log('cursor: ', document.body.style.cursor);
	}

	function resize(ev: MouseEvent) {
		if (!isResizing) {
			return;
		}

		let { isClosed: isClosedStore } = tabsContainerContext;
		let isClosed: boolean = true;
		isClosedStore.subscribe((value) => {
			isClosed = value;
		});
		let newWidth = 0;
		let mouseX = ev.clientX;

		const boundingRect = contentDiv.getBoundingClientRect();
		newWidth = mouseX - boundingRect.x;

		if (newWidth < minWidth && newWidth > widthTransitionThresholdpx) {
			newWidth = minWidth;
			isRetracted = false;
			if (isClosed) {
				tabsContainerContext.toggleClosed();
			}
		}

		if (newWidth <= widthTransitionThresholdpx) {
			newWidth = 0;
			isRetracted = true;

			if (!isClosed) {
				tabsContainerContext.toggleClosed();
			}
		}

		// if (newWidth <= 0 && !isRetracted) {
		// 	isRetracted = true;
		// }
		// if (newWidth > widthTransitionThresholdpx && isRetracted) {
		// 	isRetracted = false;
		// }
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

	const icsPaneID = Symbol();
	const propsPaneID = Symbol();

	let resizer: HTMLDivElement;

	onMount(() => {
		configResizing(resizer);
	});
</script>

<div
	class={clsx('z-10 col-start-1 row-start-1 row-end-[-1] grid h-full  overflow-hidden ', {
		'grid-cols-[min-content_var(--side-bar-width)_min-content]': !isRetracted,
		'grid-cols-[min-content_0px_0px]': isRetracted
	})}
>
	<TabsContainer
		on:tabClosed={() => {
			isRetracted = true;
			console.log('tab retracted');
			// console.log('isRetracted: ', isRetracted);
		}}
		on:tabOpened={() => {
			isRetracted = false;
			document.body.style.setProperty('--side-bar-width', `${currentWidth}px`);

			console.log('tab unretracted');
			// console.log('isRetracted: ', isRetracted);
		}}
		bind:context={tabsContainerContext}
	>
		<div
			bind:this={contentDiv}
			class="col-start-2 row-start-1 row-end-[-1] grid h-full grid-cols-1 grid-rows-subgrid overflow-auto"
		>
			<TabContent
				class="grid w-full grid-rows-[min-content_minmax(0,1fr)_min-content] gap-2 overflow-auto"
				tabID={icsPaneID}
			>
				<IntegratedCircuitsPane />
			</TabContent>
			<TabContent tabID={propsPaneID}><CircuitPropsPane /></TabContent>
		</div>
		<div
			class="col-start-1 row-start-1 row-end-[-1] flex h-full flex-col overflow-auto border border-t-0 border-neutral-700"
		>
			<TabToggle class="material-symbols-outlined" tabID={icsPaneID}>lists</TabToggle>
			<TabToggle class="material-symbols-outlined" tabID={propsPaneID}>tune</TabToggle>
		</div>
	</TabsContainer>

	<div
		class="relative z-50 col-start-3 row-start-1 row-end-[-1] h-full w-full border-l-[1px] border-neutral-700"
	>
		<div
			bind:this={resizer}
			class="pointer-events-auto h-full w-[4px] cursor-e-resize hover:bg-[var(--ornament-color)] hover:transition-colors hover:delay-100"
		></div>
	</div>
</div>
