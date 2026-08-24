<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Loader2 } from 'lucide-svelte';
	import { getSounds } from '$lib/context/sounds/sounds-context';
	import { cn } from '$lib/utils/helpers';

	type Props = HTMLButtonAttributes & {
		submitting?: boolean;
	};

	let {
		class: buttonClass,
		disabled = false,
		submitting = false,
		children,
		onclick,
		onsubmit,
		...rest
	}: Props = $props();

	const sounds = getSounds();
</script>

<button
	onclick={e => {
		sounds.play('kacha');
		onclick?.(e);
	}}
	class={cn(
		'flex items-center w-full gap-x-2 justify-center h-12 from-blue-light to-blue-primary bg-linear-to-b text-white rounded-md font-semibold text-2xl enabled:hover:brightness-110 disabled:opacity-50 px-2',
		buttonClass,
	)}
	disabled={disabled || submitting}
	{...rest}
>
	{#if submitting}
		<Loader2 class="text-white animate-spin" size={25} />
	{:else}
		{@render children?.()}
	{/if}
</button>
