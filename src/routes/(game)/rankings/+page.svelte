<script lang="ts">
	import type { PageData } from './$types';
	import { Loader2 } from 'lucide-svelte';
	import Table from './components/Table.svelte';

	type Result = Awaited<PageData['pageData']>;

	let { data } = $props();

	let result = $state<Result>();

	$effect(() => {
		(async () => {
			try {
				const newResult = await data.pageData;

				result = newResult;
			} catch (error) {
				console.error(error);
			}
		})();
	});
</script>

<svelte:head>
	<title>Grandlinedle - Rankings</title>
	<meta name="description" content="View the top 10 players of the day!" />
</svelte:head>
<main class="flex flex-col items-center w-full pb-12 max-sm:w-screen gap-y-8">
	<h1 class="p-2 text-4xl font-bold text-center text-white text-shadow-sm text-shadow-black">
		Top 10 players of the day!
	</h1>
	{#if result}
		{#if result.leaderboard.length === 0}
			<div class="text-5xl font-bold text-center text-white text-shadow-lg">
				QUICK... submit your score to be first!
			</div>
		{:else}
			<Table leaderboard={result.leaderboard} />
		{/if}
	{:else}
		<Loader2 class="text-white animate-spin" size={80} />
	{/if}
</main>
