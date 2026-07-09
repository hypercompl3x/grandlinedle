<script lang="ts">
	import { page } from '$app/state';
	import { SOLO_LINKS } from '$lib/utils/constants';
	import { cn } from '$lib/utils/helpers';

	const isActive = (href: string) => page.url.pathname === href;
</script>

<nav class="mb-2 flex shrink-0 items-center gap-x-2 rounded-full bg-white p-1.5">
	{#each SOLO_LINKS as { name, href, icon } (`${name}-link`)}
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
