<script lang="ts">
	import type { SnippetReturn } from 'svelte';
	import { cn } from '$lib/utils/helpers';
	import Arrow from '../Arrow.svelte';

	type Children = (this: void) => typeof SnippetReturn & {
		_: 'functions passed to {@render ...} tags must use the `Snippet` type imported from "svelte"';
	};

	type Props = {
		red: boolean;
		yellow?: boolean;
		children: Children;
		class?: string | Record<string, boolean>;
		arrow?: 'up' | 'down';
	};

	let { red, yellow = false, children, class: className, arrow }: Props = $props();
</script>

<div
	class={cn(
		'flex items-center justify-center border border-green-light rounded-md bg-green-primary px-1 relative',
		{
			'bg-red-light border-red-dark': red,
			'bg-yellow-primary border-yellow-dark': yellow,
		},
		className,
	)}
>
	{@render children()}
	{#if arrow}
		<div class="absolute inset-0 w-11/12 m-auto h-fit">
			<Arrow direction={arrow} />
		</div>
	{/if}
</div>
