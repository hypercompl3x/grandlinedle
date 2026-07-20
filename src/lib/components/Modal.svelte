<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/helpers';
	import { X } from 'lucide-svelte';

	type Props = {
		name: string;
		children: Snippet;
		button: Snippet<[() => void]>;
		disableClose?: boolean;
		headerClass?: string;
		containerClass?: string;
		wide?: boolean;
	};

	let {
		name,
		headerClass,
		containerClass,
		children,
		button,
		disableClose = false,
		wide = false,
	}: Props = $props();

	let dialog = $state<HTMLDialogElement>();
</script>

{@render button(() => dialog?.showModal())}
<dialog
	bind:this={dialog}
	class={cn(
		'w-[calc(100%-32px)] sm:w-full overflow-hidden rounded-md max-w-96 backdrop:bg-black backdrop:opacity-40 fixed inset-0 m-auto h-fit',
		{
			'max-w-xl': wide,
		},
	)}
	onclick={e => {
		if (e.target === dialog && !disableClose) {
			dialog.close();
		}
	}}
>
	<div class={cn('relative flex justify-center p-2 text-white', headerClass)}>
		<div class="text-xl font-semibold sm:text-3xl">{name}</div>
		<button
			type="button"
			onclick={() => dialog?.close()}
			disabled={disableClose}
			class="absolute inset-y-0 focus:ring-0 focus:outline-hidden right-2"
		>
			<X class="stroke-2 sm:stroke-[3px] size-6 sm:size-8" />
		</button>
	</div>
	<div class={cn('flex flex-col items-center text-lg', containerClass)}>
		{@render children()}
	</div>
</dialog>
