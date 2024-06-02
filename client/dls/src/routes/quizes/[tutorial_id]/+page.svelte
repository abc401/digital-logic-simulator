<script context="module" lang="ts">
	export enum AnswerStatus {
		Correct,
		Incorrect,
		UnAttempted
	}
</script>

<script lang="ts">
	import { onMount, setContext } from 'svelte';

	import './quiz-style.css';
	import Mcq from '@src/lib/components/Mcq/Mcq.svelte';

	export let data;
	let answerStatuses = new Array<AnswerStatus>(data.mcqs.length).fill(AnswerStatus.UnAttempted);
	setContext('quiz-answers', answerStatuses);
	let nCorrect = 0;
	let nIncorrect = 0;
	let nTotal = data.mcqs.length;

	let submitted = false;

	onMount(() => {
		const radioInputs = document.querySelectorAll<HTMLInputElement>('input[type=radio]');
		for (const input of radioInputs) {
			input.checked = false;
			console.log(input);
		}
		window.onbeforeunload = function () {
			window.scrollTo(0, 0);
		};
	});
</script>

<h1>{data.tutorial.display_title} - Quiz</h1>
<div>
	{#each data.mcqs as mcq, idx}
		<Mcq {mcq} {idx} />
	{/each}
</div>
<div style="display: flex; flex-direction: row-reverse;">
	<button
		class="link-btn inline-block"
		disabled={submitted}
		on:click={submitted
			? () => {}
			: () => {
					if (answerStatuses.indexOf(AnswerStatus.UnAttempted) != -1) {
						alert('Please attempt all questions.');
						return;
					}
					nCorrect = answerStatuses.reduce((acc, cur) => {
						if (cur === AnswerStatus.Correct) {
							return acc + 1;
						}
						return acc;
					}, 0);
					nIncorrect = answerStatuses.reduce((acc, cur) => {
						if (cur === AnswerStatus.Incorrect) {
							return acc + 1;
						}
						return acc;
					}, 0);
					submitted = true;
				}}>Submit</button
	>
</div>

{#if submitted}
	<div class="results">
		<h2>Your Results</h2>
		<div class="stats">
			<div>
				<div>Total</div>
				<div>{nTotal}</div>
			</div>
			<hr />
			<div style="color: green;">
				<div>Correct</div>
				<div>{nCorrect}</div>
			</div>
			<hr />
			<div style="color: red;">
				<div>Incorrect</div>
				<div>{nIncorrect}</div>
			</div>
		</div>
		<div
			style="display:flex; justify-content: space-between; margin-inline: 1rem; font-size: 1rem;"
		>
			<button
				class="link-btn"
				on:click={() => {
					window.location.reload();
				}}>Retake Quiz</button
			>
			{#if data.tutorial.next != null}
				<a class="link-btn" href={`/tutorials/${data.tutorial.next}`}>Next Tutorial</a>
			{:else}
				<a class="link-btn" href={`/tutorials/index`}>Goto Home</a>
			{/if}
		</div>
	</div>
{/if}
