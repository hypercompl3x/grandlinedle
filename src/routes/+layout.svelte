<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import { X } from 'lucide-svelte';
	import GrandlinedleLogo from '$lib/assets/grandlinedle-logo.png';
	import { cn } from '$lib/utils/helpers';
	import '../app.css';

	let { data, children }: LayoutProps = $props();

	const LINKS = [
		{ name: 'Classic', href: '/' },
		{ name: 'Location', href: '/location' },
		{ name: 'Quote', href: '/quote' },
	];

	let dialog = $state<HTMLDialogElement>();
	let showCopiedMessage = $state(false);
	const copyText = $derived(
		() => `I've completed all the modes of Grandlinedle #${data.todayNumber} today:
❓ Classic: ${data.characterGuessesLen}
🌍 Location: ${data.locationGuessesLen}
💬 Quote: ${data.quoteCharacterGuessesLen}
https://grandlinedle.com`,
	);

	$effect(() => {
		if (!dialog) return;

		if (data.completed) {
			if (!dialog.open) dialog.showModal();
		} else {
			if (dialog.open) dialog.close();
		}
	});

	const copyToClipboard = () => {
		navigator.clipboard.writeText(copyText());
		showCopiedMessage = true;
		setTimeout(() => (showCopiedMessage = false), 1500);
	};
</script>

<div class="h-[100svh] min-h-[100svh] overflow-hidden overflow-y-auto">
	<div class="flex flex-col items-center h-full max-w-screen-md mx-auto">
		<img
			alt="The grandlinedle logo"
			src={GrandlinedleLogo}
			class="my-4 transition-transform duration-300 ease-in-out rounded-lg w-96 hover:scale-105"
		/>
		{#if data.completed}
			<button
				type="button"
				class="py-1.5 px-3 font-semibold text-2xl rounded-md bg-red-primary text-white mb-4"
				onclick={() => dialog?.showModal()}>Share your results!</button
			>
		{/if}
		<nav class="flex items-center p-1.5 bg-white rounded-md shrink-0 gap-x-1.5 mb-2">
			{#each LINKS as { name, href } (`${name}-link`)}
				<a
					{href}
					class={cn('py-1.5 px-3 font-bold text-lg rounded-md', {
						'bg-blue-dark text-white': page.url.pathname === href,
					})}
				>
					{name}
				</a>
			{/each}
		</nav>

		{@render children()}
	</div>
</div>

<dialog
	bind:this={dialog}
	class="w-[calc(100%-32px)] sm:w-full overflow-hidden rounded-md max-w-96 backdrop:bg-black backdrop:bg-opacity-40"
	onclick={e => {
		if (e.target === dialog) {
			dialog.close();
		}
	}}
>
	<div class="relative flex justify-center p-2 text-white bg-red-primary">
		<div class="text-xl font-semibold sm:text-3xl">Congratulations!</div>
		<button
			type="button"
			onclick={() => dialog?.close()}
			class="absolute inset-y-0 focus:ring-0 focus:outline-none right-2"
			><X class="stroke-2 sm:stroke-[3px] size-6 sm:size-8" /></button
		>
	</div>
	<div class="p-2 space-y-2 text-lg text-center">
		<div>I've completed all the modes of <b>Grandlinedle</b> #{data.todayNumber} today:</div>
		<div>
			<div>❓ Classic: {data.characterGuessesLen}</div>
			<div>🌍 Location: {data.locationGuessesLen}</div>
			<div>💬 Quote: {data.quoteCharacterGuessesLen}</div>
		</div>
		<div>https://grandlinedle.com</div>
		<div>
			{#if showCopiedMessage}
				<div class="text-base font-bold">Copied successfully!</div>{/if}
			<button
				type="button"
				class="py-1.5 px-3 font-bold text-lg rounded-md bg-blue-dark text-white"
				onclick={copyToClipboard}>COPY</button
			>
		</div>
	</div>
</dialog>
