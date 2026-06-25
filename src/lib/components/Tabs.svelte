<script lang="ts">
	import { page } from '$app/state';
	import { crossfade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { cn } from '$lib/utils/helpers';

	const LINKS = [
		{ name: 'Classic', href: '/classic' },
		{ name: 'Location', href: '/location' },
		{ name: 'Quote', href: '/quote' },
		{ name: 'Crew', href: '/crew' },
		{ name: 'Leaderboard', href: '/leaderboard' },
	];

	const [send, receive] = crossfade({
		duration: 180,
		easing: cubicOut,
	});

	const isActive = (href: string) => page.url.pathname === href;
</script>

<nav
	class="relative mb-2 flex shrink-0 items-center gap-x-1.5 rounded-md bg-white p-1.5 max-sm:flex-col"
>
	{#each LINKS as { name, href } (`${name}-link`)}
		<a
			{href}
			class={cn(
				'relative isolate rounded-md px-3 py-1.5 text-lg font-bold transition-colors max-sm:w-full max-sm:text-center',
				isActive(href) ? 'text-white duration-150' : 'text-black duration-0',
			)}
		>
			{#if isActive(href)}
				<span
					class="absolute inset-0 rounded-md -z-10 bg-blue-dark"
					in:receive={{ key: 'active-tab' }}
					out:send={{ key: 'active-tab' }}
				></span>
			{/if}

			<span class="relative z-10">{name}</span>
		</a>
	{/each}
</nav>
