<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import GrandlinedleLogo from '$lib/assets/grandlinedle-logo.png';
	import Settings from '$lib/components/Settings.svelte';
	import PatchNotes from '$lib/components/PatchNotes.svelte';
	import CongratsModal from '$lib/components/CongratsModal.svelte';
	import Banner from '$lib/components/Banner.svelte';
	import { cn } from '$lib/utils/helpers';
	import '../app.css';

	let { data, children }: LayoutProps = $props();

	let dialog = $state<HTMLDialogElement>();
</script>

<div class="h-dvh min-h-dvh overflow-hidden overflow-y-auto">
	<div
		class={cn('flex flex-col items-center h-full mx-auto', {
			'max-w-(--breakpoint-lg)': page.url.pathname === '/rankings',
			'max-w-(--breakpoint-md)': page.url.pathname !== '/rankings',
		})}
	>
		<div class="w-full flex justify-center items-center">
			<PatchNotes />
			<a href="/" class="transition-transform duration-300 ease-in-out hover:scale-105">
				<img alt="The grandlinedle logo" src={GrandlinedleLogo} class="my-4 w-96" />
			</a>
			<Settings hideSuggestionBanner={data.hideSuggestionBanner} />
		</div>
		{#if data.completed}
			<button
				type="button"
				class="py-1.5 px-3 font-semibold text-2xl rounded-md bg-red-primary text-white mb-4"
				onclick={() => dialog?.showModal()}>Share your results!</button
			>
		{/if}
		{@render children()}
	</div>
</div>

<CongratsModal {data} bind:dialog></CongratsModal>
<Banner hideSuggestionBanner={data.hideSuggestionBanner} />
