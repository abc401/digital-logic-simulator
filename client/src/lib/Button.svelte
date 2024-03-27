<script lang="ts">
	import clsx from 'clsx';

	let className = '';
	export { className as class };
</script>

<button
	on:click
	class={clsx(`mx-1 my-0.5 px-2 py-0.5 outline outline-1 outline-red-500`, className)}
	{...$$restProps}
>
	<slot />
</button>
