<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils/helpers';

	type Props = HTMLInputAttributes & {
		error?: string;
		label: string;
	};

	let { error, label, required, ...rest }: Props = $props();
</script>

<div class="flex flex-col space-y-1 w-full">
	<label class="text-lg font-medium text-left">
		{label}
		{#if required}
			<span class="text-red-primary">*</span>
		{/if}
		<input
			class={cn(
				'w-full h-10 px-3 py-2 border border-black rounded-md focus-visible:outline-hidden mt-0.5 bg-white',
				{
					'border-red-primary': !!error,
				},
			)}
			{...rest}
		/>
	</label>
	<p class="text-sm text-left text-red-primary h-5">
		{error}
	</p>
</div>
