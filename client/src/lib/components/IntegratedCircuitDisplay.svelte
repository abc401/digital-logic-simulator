<script lang="ts">
	import { actionsManager, sceneManager } from '@src/routes/+page.svelte';
	import { RenameICUserAction, icNames, integratedCircuits } from '../stores/integrated-circuits';
	import { currentScene, type ID } from '@src/ts/scene/scene';
	import { CustomCircuitInputs } from '@src/ts/scene/objects/circuits/custom-circuit-inputs';
	import clsx from 'clsx';

	export let sceneId: ID;
	export let name: string;

	$: isSelected = ($currentScene.id as ID) === sceneId;

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
	class={clsx('px-4 py-2 text-start text-sm ', {
		'bg-accent': isSelected,
		'hover:bg-neutral-700': !isSelected
	})}
>
	{#if renaming}
		<input
			bind:this={input}
			class="border-neutral-700 bg-neutral-500"
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
			on:click={() => {
				console.log(`Switching to ${name} scene`);
				sceneManager.setCurrentScene(sceneId);
			}}
		>
			{name}
		</button>
	{/if}
	<button
		class="material-symbols-outlined | text-sm"
		on:click={() => {
			renaming = true;
			// input.focus();
			// integratedCircuits.rename(sceneId, name + ' renamed');
		}}>edit</button
	>
</div>
