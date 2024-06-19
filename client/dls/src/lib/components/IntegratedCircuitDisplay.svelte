<script lang="ts">
	import { actionsManager, sceneManager } from '@src/routes/dls/+page.svelte';
	import type { ID } from '@src/ts/scene/scene';
	import { icNames } from '@stores/integrated-circuits';
	import { RenameICUserAction } from '@ts/interactivity/actions';
	import { currentScene } from '@stores/currentScene';
	import clsx from 'clsx';

	export let sceneId: ID;
	export let name: string;

	$: isSelected = ($currentScene?.id as ID) === sceneId;

	let renaming = false;
	let input: HTMLInputElement | undefined;

	function escapeHandeler(ev: KeyboardEvent) {
		if (ev.code === 'Escape') {
			renaming = false;
		}
	}

	$: {
		if (renaming) {
			document.addEventListener('keydown', escapeHandeler);
		} else {
			document.removeEventListener('keydown', escapeHandeler);
		}

		if (renaming && input != null) {
			input.focus();
			input.select();
		}
	}

	function verifyICName(newName: string) {
		newName = newName.trim();
		if (newName === name) {
			return false;
		}
		if (newName === '' || icNames.has(newName.toLowerCase())) {
			return false;
		}
		return true;
	}
</script>

<div
	class={clsx('grid grid-cols-[min-content_minmax(0,1fr)] text-start text-sm font-normal ', {
		'bg-accent': isSelected,
		'hover:bg-neutral-700': !isSelected
	})}
>
	<!-- {'absolute right-0 top-1/2 -translate-y-1/2 px-3 py-2 text-sm hover:bg-neutral-500/50'} -->
	<button
		class={clsx('material-symbols-outlined | px-3 py-2 text-sm ', {
			'hover:bg-neutral-500/50': sceneId !== 0,
			'text-transparent': sceneId === 0
		})}
		on:click={() => {
			if (sceneId != 0) {
				renaming = true;
			}
			// input.focus();
			// integratedCircuits.rename(sceneId, name + ' renamed');
		}}>edit</button
	>
	{#if renaming}
		<input
			bind:this={input}
			class="border-neutral-700 bg-neutral-500/50 px-4 py-2"
			type="text"
			value={name}
			on:blur={() => {
				renaming = false;
			}}
			on:change={(ev) => {
				const newName = ev.currentTarget.value;
				if (verifyICName(newName)) {
					actionsManager.do(new RenameICUserAction(sceneId, newName));
				}
				renaming = false;
			}}
		/>
	{:else}
		<button
			class={clsx('w-full py-2 pe-4 text-start', {})}
			on:click={() => {
				console.log(`Switching to ${name} scene`);
				sceneManager.setCurrentScene(sceneId);
			}}
		>
			{name}
		</button>
	{/if}
</div>
