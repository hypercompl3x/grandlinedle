<script>
	import { page } from '$app/state';
	import GrandlinedleLogo from '$lib/assets/grandlinedle-logo.png';
	import { cn } from '$lib/utils/helpers';
	import '../app.css';

	const LINKS = [
		{ name: 'Classic', href: '/' },
		{ name: 'Location', href: '/location' },
		{ name: 'Quote', href: '/quote' },
	];
</script>

<div
	class="h-screen overflow-hidden overflow-y-auto bg-center bg-no-repeat bg-cover bg-page-background"
>
	<div class="flex flex-col items-center h-full max-w-screen-md mx-auto">
		<img
			alt="The grandlinedle logo"
			src={GrandlinedleLogo}
			class="my-4 transition-transform duration-300 ease-in-out rounded-lg w-96 hover:scale-105"
		/>
		<nav class="flex items-center p-1.5 bg-white rounded-md shrink-0 gap-x-1.5 mb-2">
			{#each LINKS as { name, href } (`${name}-link`)}
				<a
					{href}
					class={cn('p-1.5 font-bold text-lg rounded-md', {
						'bg-blue-dark text-white': page.url.pathname === href,
					})}
				>
					{name}
				</a>
			{/each}
		</nav>
		<slot />
	</div>
</div>
