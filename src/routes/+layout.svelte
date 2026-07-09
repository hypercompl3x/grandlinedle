<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import Settings from './_components/Settings.svelte';
	import PatchNotes from './_components/PatchNotes.svelte';
	import Results from './_components/Results.svelte';
	import Footer from './_components/Footer/index.svelte';
	import { cn } from '$lib/utils/helpers';
	import '../app.css';

	let { data, children }: LayoutProps = $props();
</script>

<div class="h-dvh min-h-dvh overflow-hidden overflow-y-auto">
	<div
		class={cn('flex flex-col items-center h-full mx-auto', {
			'max-w-(--breakpoint-lg)': page.route.id === '/(solo)/rankings',
			'max-w-(--breakpoint-md)': page.route.id !== '/(solo)/rankings',
		})}
	>
		<div class="w-full flex justify-center items-center px-4 my-4">
			<PatchNotes />
			<a href="/" class="transition-transform duration-300 ease-in-out hover:scale-105">
				<img alt="The grandlinedle logo" src="/grandlinedle-logo.png" class="w-96" />
			</a>
			<Settings enableEasterEggs={data.enableEasterEggs} />
		</div>
		{#if data.completed}
			<Results {data} />
		{/if}
		{@render children()}
		<Footer />
	</div>
</div>
