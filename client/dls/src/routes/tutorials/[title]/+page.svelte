<script context="module" lang="ts">
</script>

<script>
	import { currentTut, tutorialNav } from '@src/lib/stores/tutorials';
	import './tut-style.css';

	$: next = tutorialNav.get()?.find((value) => value.link_title === $currentTut?.next);
	$: previous = tutorialNav.get()?.find((value) => value.link_title === $currentTut?.previous);
</script>

{@html $currentTut?.content}
<nav>
	{#if previous != null}
		<a
			data-sveltekit-preload-data="off"
			style="float: inline-start;"
			href={`/tutorials/${previous.link_title}`}>Previous</a
		>
	{/if}

	{#if next != null}
		<a
			data-sveltekit-preload-data="off"
			style="float: inline-end;"
			href={`/tutorials/${next.link_title}`}>Next</a
		>
	{/if}
</nav>
