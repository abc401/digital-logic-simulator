<script context="module" lang="ts">
</script>

<script>
	import { currentTut, tutorialNav } from '@src/lib/stores/tutorials';
	import './tut-style.css';

	$: next = tutorialNav.get()?.find((value) => value.link_title === $currentTut?.next);
	$: previous = tutorialNav.get()?.find((value) => value.link_title === $currentTut?.previous);
</script>

{@html $currentTut?.content}

<nav class="tut-nav">
	<div>
		{#if previous != null}
			<a
				data-sveltekit-preload-data="off"
				class="link-btn inline-block"
				href={`/tutorials/${previous.link_title}`}>Previous Tutorial</a
			>
		{/if}
	</div>
	<div></div>

	<div>
		{#if $currentTut?.link_title === 'index'}
			<a
				data-sveltekit-preload-data="off"
				class="link-btn inline-block"
				href={`/tutorials/${next?.link_title}`}>Next Tutorial</a
			>
		{:else}
			<a
				data-sveltekit-preload-data="off"
				class="link-btn inline-block"
				href={`/quizes/${$currentTut?.id}`}>Test You Knowledge</a
			>
		{/if}
	</div>
</nav>
