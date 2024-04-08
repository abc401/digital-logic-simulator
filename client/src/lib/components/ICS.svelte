<script context="module" lang="ts">
	let isResizing = false;
	let minWidth = 0;
	let containerDiv: HTMLDivElement;
	let list: HTMLElement;
	let widthTransitionThresholdpx = 5;
	let onRetractedHandeler = () => {};

	export function onRetracted(handeler: () => void) {
		onRetractedHandeler = handeler;
	}

	export function configICBarResizing(resizer: HTMLDivElement) {
		if (list == null || containerDiv == null) {
			throw Error();
		}

		let minWidthStr = getComputedStyle(document.body).getPropertyValue('--ics-min-width');
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

		const boundingRect = containerDiv.getBoundingClientRect();
		let newWidth = mouseX - boundingRect.x;

		if (newWidth < minWidth && newWidth > widthTransitionThresholdpx) {
			newWidth = minWidth;
		}

		if (newWidth <= widthTransitionThresholdpx) {
			newWidth = 0;
		}

		document.body.style.setProperty('--integrated-circuits-width', `${newWidth}px`);
		console.log('new width: ', newWidth);
		list.scrollLeft = 0;
		ev.preventDefault();
		if (newWidth === 0) {
			onRetractedHandeler();
		}
	}

	function stopResizing() {
		isResizing = false;
		rootDiv.style.pointerEvents = 'auto';
		document.body.style.cursor = 'auto';
	}
</script>

<script lang="ts">
	import { rootDiv, sceneManager } from '@routes/+page.svelte';
	import { integratedCircuits } from '@src/lib/stores/integrated-circuits';
	import clsx from 'clsx';

	let className = '';
	export { className as class };

	function newCustomCircuit() {
		let circuitName = prompt('Enter name for custom circuit');
		while (true) {
			if (circuitName == null) {
				return;
			}
			if (circuitName.trim() === '') {
				circuitName = prompt('The name for the custom circuit cannot be empty');
				continue;
			}

			if ($integratedCircuits.get(circuitName) != null) {
				circuitName = prompt('The provided name has already been used for another circuit');
				continue;
			}
			break;
		}
		integratedCircuits.newIC(circuitName);
	}
</script>

<div bind:this={containerDiv} class={clsx('relative ', className)} {...$$restProps}>
	<span class=" px-4 py-2 text-xs uppercase opacity-60">Integrated Circuits</span>
	<div class="overflow-auto [scrollbar-width:thin]">
		<ul bind:this={list} class="grid max-h-full grid-flow-row">
			{#each $integratedCircuits as [name, sceneId] (name)}
				<button
					class=" px-4 py-2 text-start text-sm hover:bg-neutral-700 active:bg-neutral-500"
					on:click={() => {
						console.log(`Switching to ${name} scene`);
						sceneManager.setCurrentScene(sceneId);
					}}
				>
					{name}
				</button>
			{/each}
		</ul>
	</div>
	<button
		class="border-t-[1px] border-neutral-700 px-4 py-2 text-start text-xs text-neutral-400 hover:bg-neutral-700 active:bg-neutral-500"
		on:click={newCustomCircuit}>New Circuit</button
	>
</div>
