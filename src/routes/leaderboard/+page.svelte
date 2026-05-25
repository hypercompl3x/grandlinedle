<script lang="ts">
	import { NUMBER_OF_GAME_MODES } from '$lib/utils/constants.js';
	import { Loader2 } from 'lucide-svelte';

	type Result = Awaited<typeof data.pageData>;

	let { data } = $props();

	let result = $state<Result>();
	let gettingNewData = $state(false);

	$effect(() => {
		(async () => {
			try {
				gettingNewData = true;

				const newResult = await data.pageData;

				result = newResult;
				gettingNewData = false;
			} catch (error) {
				console.error(error);
			}
		})();
	});
</script>

<svelte:head>
	<title>Grandlinedle - Leaderboard</title>
	<meta name="description" content="View the top 10 players daily!" />
</svelte:head>
<main class="flex flex-col items-center w-full h-full max-sm:w-screen gap-y-8">
	<h1 class="p-2 text-4xl font-bold text-center text-white rounded-md bg-opacity-35 text-shadow-1">
		Top 10 players of the day!
	</h1>
	{#if result}
		{#if result.leaderboard.length === 0}
			<div class="text-5xl font-bold text-center text-white text-shadow-1">
				QUICK... submit your score to be first!
			</div>
		{:else}
			<div class="w-full px-4 pb-10 space-y-4 max-sm:hidden">
				<div
					class="flex items-center w-full text-lg font-bold text-center bg-white rounded-md shadow-lg h-14 md:text-2xl"
				>
					<div class="basis-1/6">Position</div>
					<div class="basis-1/6">Player</div>
					<div class="basis-1/6">Classic</div>
					<div class="basis-1/6">Location</div>
					<div class="basis-1/6">Quote</div>
					<div class="basis-1/6">Crew</div>
				</div>
				{#each result.leaderboard as { id, player, classic, location, quote, crew }, index (`desktop-table-${id}`)}
					<div
						class="flex items-center w-full h-16 text-lg font-semibold text-center text-white rounded-md shadow-lg bg-green-primary md:text-2xl"
					>
						<div class="basis-1/6">
							#{index + 1}
						</div>
						<div class="truncate basis-1/6 grow-0">
							{player}
						</div>
						<div class="basis-1/6">
							{classic}
						</div>
						<div class="basis-1/6">
							{location}
						</div>
						<div class="basis-1/6">
							{quote}
						</div>
						<div class="basis-1/6">
							{crew}
						</div>
					</div>
				{/each}
			</div>
			<div class="w-full px-2 pb-6 space-y-2 sm:hidden">
				<div
					class="flex items-center w-full h-12 text-base font-bold text-center bg-white rounded-md shadow-lg"
				>
					<div class="basis-1/3">Position</div>
					<div class="basis-1/3">Player</div>
					<div class="basis-1/3">Avg Guesses</div>
				</div>
				{#each result.leaderboard as { id, player, classic, location, quote }, index (`mobile-table-${id}`)}
					{@const averageGuesses =
						Math.round(((classic + location + quote) / NUMBER_OF_GAME_MODES) * 10) / 10}
					<div
						class="flex items-center w-full h-12 text-sm font-semibold text-center text-white rounded-md shadow-lg bg-green-primary"
					>
						<div class="basis-1/3">
							#{index + 1}
						</div>
						<div class="truncate basis-1/3 grow-0">
							{player}
						</div>
						<div class="basis-1/3">
							{averageGuesses}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{:else}
		<Loader2 class="text-white animate-spin" size={80} />
	{/if}
</main>
