<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import Settings from './components/Settings.svelte';
	import PatchNotes from './components/PatchNotes.svelte';
	import Results from './components/Results.svelte';
	import Banner from './components/Banner.svelte';
	import Footer from './components/Footer.svelte';
	import { cn } from '$lib/utils/helpers';
	import '../app.css';

	let { data, children }: LayoutProps = $props();

	let pageHasError = $derived(!!page.error?.message);
</script>

<div class="h-dvh min-h-dvh overflow-hidden overflow-y-auto">
	<div
		class={cn('flex flex-col items-center h-full mx-auto', {
			'max-w-(--breakpoint-lg)': page.url.pathname === '/rankings',
			'max-w-(--breakpoint-md)': page.url.pathname !== '/rankings',
		})}
	>
		<div class="w-full flex justify-center items-center px-4 my-4">
			{#if !pageHasError}
				<PatchNotes />
				<a href="/" class="transition-transform duration-300 ease-in-out hover:scale-105">
					<img alt="The grandlinedle logo" src="/grandlinedle-logo.png" class="w-96" />
				</a>
				<Settings hideSuggestionBanner={data.hideSuggestionBanner} />
			{:else}
				<a href="/" class="transition-transform duration-300 ease-in-out hover:scale-105">
					<img alt="The grandlinedle logo" src="/grandlinedle-logo.png" class="w-96" />
				</a>
			{/if}
		</div>
		{#if data.completed && !pageHasError}
			<Results {data} />
		{/if}
		{@render children()}
		<Footer />
	</div>
</div>

{#if !pageHasError}
	<Banner hideSuggestionBanner={data.hideSuggestionBanner} />
{/if}
