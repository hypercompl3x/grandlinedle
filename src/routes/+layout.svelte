<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import GrandlinedleLogo from '$lib/assets/grandlinedle-logo.png';
	import CongratsModal from '$lib/components/CongratsModal.svelte';
	import Banner from '$lib/components/Banner.svelte';
	import { cn } from '$lib/utils/helpers';
	import '../app.css';

	let { data, children }: LayoutProps = $props();

	let dialog = $state<HTMLDialogElement>();

	const LINKS = [
		{ name: 'Classic', href: '/' },
		{ name: 'Location', href: '/location' },
		{ name: 'Quote', href: '/quote' },
		{ name: 'Leaderboard', href: '/leaderboard' },
	];
</script>

<div class="h-[100dvh] min-h-[100dvh] overflow-hidden overflow-y-auto">
	<div
		class={cn('flex flex-col items-center h-full max-w-screen-md mx-auto', {
			'max-w-screen-lg': page.url.pathname === '/leaderboard',
		})}
	>
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
		<nav
			class="flex items-center p-1.5 bg-white rounded-md shrink-0 gap-x-1.5 mb-2 max-sm:flex-col"
		>
			{#each LINKS as { name, href } (`${name}-link`)}
				<a
					{href}
					class={cn('py-1.5 px-3 font-bold text-lg rounded-md max-sm:w-full max-sm:text-center', {
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

<CongratsModal {data} bind:dialog></CongratsModal>
<Banner></Banner>
