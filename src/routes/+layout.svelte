<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import PatchNotes from './_components/PatchNotes.svelte';
	import Settings from './_components/Settings.svelte';
	import { cn } from '$lib/utils/helpers';
	import '../app.css';

	let { children, data }: LayoutProps = $props();
</script>

<div class="h-dvh min-h-dvh overflow-hidden overflow-y-auto">
	<div
		class={cn('flex flex-col items-center h-full mx-auto', {
			'max-w-(--breakpoint-lg)':
				page.route.id === '/(solo)/rankings' || page.route.id?.includes('/online'),
			'max-w-(--breakpoint-md)':
				page.route.id !== '/(solo)/rankings' && !page.route.id?.includes('/online'),
		})}
	>
		<div class="w-full flex justify-center items-center px-4 my-4">
			<PatchNotes />
			<button
				type="button"
				onclick={() => goto('/')}
				class="transition-transform duration-300 ease-in-out enabled:hover:scale-105"
				disabled={page.route.id === '/online/[roomCode]'}
			>
				<img alt="The grandlinedle logo" src="/grandlinedle-logo.png" class="w-96" />
			</button>
			<Settings enableEasterEggs={data.enableEasterEggs} />
		</div>
		{@render children()}
	</div>
</div>
