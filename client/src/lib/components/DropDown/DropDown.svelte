<script context="module" lang="ts">
	export class DropDownContext {
		dropDownId: Symbol;
		open: Writable<boolean>;
		expandedChild: Writable<Symbol | undefined>;
		constructor(public parentContext: DropDownContext | undefined) {
			this.dropDownId = Symbol();
			this.open = writable(false);
			this.expandedChild = writable(undefined);

			if (parentContext != null) {
				parentContext.expandedChild.subscribe((value) => {
					if (value === this.dropDownId) {
						return;
					}
					this.open.set(false);
				});
			}
		}

		toggleStatus() {
			this.open.update((value) => {
				if (value) {
					if (this.parentContext != null) {
						this.parentContext.expandedChild.set(undefined);
					}
				} else {
					if (this.parentContext != null) {
						this.parentContext.expandedChild.set(this.dropDownId);
					}
				}
				return !value;
			});
		}
	}
</script>

<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	let parentContext = getContext<DropDownContext | undefined>('drop-down-context');
	let context = new DropDownContext(parentContext);

	setContext<DropDownContext>('drop-down-context', context);
</script>

<slot />

<!-- {#each Object.keys(config) as key}
		{#if config[key] instanceof Function || config[key] == null}
			<MenuItem text={key} on:click={getFunction(key)} />
		{:else}
			<MenuItemExpandable text={key}>
				<svelte:self config={config[key]} />
			</MenuItemExpandable>
		{/if}
	{/each} -->
