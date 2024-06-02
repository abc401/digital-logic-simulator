<script context="module" lang="ts">
	let differentiator = 0;
</script>

<script lang="ts">
	import type { MCQ } from '@src/routes/quizes/[tutorial_id]/+page';
	import { AnswerStatus } from '@src/routes/quizes/[tutorial_id]/+page.svelte';
	import { getContext } from 'svelte';
	import './mcq-style.css';

	export let mcq: MCQ;
	export let idx: number;

	differentiator++;

	let nameString = `mcq-component-differentiator-${differentiator}`;

	let context = getContext<AnswerStatus[]>('quiz-answers');

	function onOptionSelected(optionIdx: number) {
		if (optionIdx === mcq.correctOption) {
			context[idx] = AnswerStatus.Correct;
		} else {
			context[idx] = AnswerStatus.Incorrect;
		}
		console.log('Quiz Answers: ', context);
	}

	function getID(optionNumber: number) {
		return `${nameString}-option-${optionNumber}`;
	}
</script>

<div class="mcq-parent">
	<span>{mcq.stmt}</span>
	{#each [mcq.o1, mcq.o2, mcq.o3, mcq.o4] as option, idx}
		<label for={getID(idx)}>
			<input
				type="radio"
				on:change={() => onOptionSelected(idx)}
				name={nameString}
				id={getID(idx)}
			/>
			<span>{option}</span>
		</label>
	{/each}
</div>
