<script lang="ts">
	import { ONLINE_LINKS, SOLO_LINKS } from '$lib/utils/constants';
	import { cn } from '$lib/utils/helpers';

	const HOME_LINKS = [...SOLO_LINKS, ...ONLINE_LINKS];
</script>

<nav class="space-y-10">
	{#each HOME_LINKS as { name, href, icon } (`${name}-link`)}
		<a
			{href}
			class={cn(
				'px-5 h-14 font-bold text-white rounded-full from-blue-light to-blue-primary text-2xl bg-linear-to-b text-center hover:brightness-110 flex items-center gap-x-2.5 w-52',
				{
					'from-green-light to-green-primary': name === 'Rankings',
					'from-red-primary to-red-medium-dark': name === 'Online',
				},
			)}
		>
			<span>{icon}</span>
			<span>{name}</span>
		</a>
	{/each}
</nav>
