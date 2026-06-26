<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '$lib/utils/helpers';

	type Props = {
		isHomePage: boolean;
	};

	let { isHomePage }: Props = $props();

	const LINKS = [
		{ name: 'Classic', href: '/classic', icon: '❓' },
		{ name: 'Location', href: '/location', icon: '🌍' },
		{ name: 'Quote', href: '/quote', icon: '💬' },
		{ name: 'Crew', href: '/crew', icon: '🏴‍☠️' },
		{ name: 'Rankings', href: '/rankings', icon: '🏆' },
	] as const;

	const isActive = (href: string) => page.url.pathname === href;
</script>

{#if isHomePage}
	<nav class="space-y-10">
		{#each LINKS as { name, href, icon } (`${name}-link`)}
			<a
				{href}
				class={cn(
					'px-5 h-14 font-bold text-white rounded-full from-blue-light to-blue-primary text-2xl bg-linear-to-b text-center hover:brightness-110 flex items-center gap-x-2.5 w-52',
					{
						'from-green-light to-green-primary': name === 'Rankings',
					},
				)}><span>{icon}</span><span>{name}</span></a
			>
		{/each}
	</nav>
{:else}
	<nav class="relative mb-2 flex shrink-0 items-center gap-x-2 rounded-full bg-white p-1.5">
		{#each LINKS as { name, href, icon } (`${name}-link`)}
			<a
				{href}
				class={cn(
					'rounded-full text-xl font-bold flex items-center justify-center group/link px-2.5 py-1.5',
					{
						'opacity-55': !isActive(href),
					},
				)}
			>
				<span class="group-hover/link:scale-110">{icon}</span>
			</a>
		{/each}
	</nav>
{/if}
