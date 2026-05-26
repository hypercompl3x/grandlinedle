<script lang="ts">
	import { untrack } from 'svelte';
	import { Loader2 } from 'lucide-svelte';
	import SuccessBox from '$lib/components/SuccessBox.svelte';
	import { animateNewItem, preloadImage } from '$lib/utils/helpers';
	import GenericSearch from '$lib/components/GenericSearch/index.svelte';
	import Crews from '$lib/components/Crews.svelte';
	import { getCrewsFromQuery } from '$lib/services/crewService.js';

	type Result = Awaited<typeof data.pageData>;

	let { data } = $props();

	let result = $state<Result>();
	let gettingNewData = $state(false);

	$effect(() => {
		(async () => {
			try {
				const oldResult = untrack(() => result);

				gettingNewData = true;

				const newResult = await data.pageData;

				await Promise.all([
					...newResult.guesses.map(i => preloadImage(i.url)),
					preloadImage(newResult.currentCrew.url),
				]);

				result = newResult;
				gettingNewData = false;

				const firstIdChanged = oldResult && oldResult.guesses?.[0]?.id !== result?.guesses?.[0]?.id;

				if (firstIdChanged) {
					const playerHasWon = result?.currentCrew?.id === result?.guesses?.[0]?.id;
					await animateNewItem(playerHasWon, 'crew');
				}
			} catch (error) {
				console.error(error);
			}
		})();
	});
</script>

<svelte:head>
	<title>Grandlinedle - Crew</title>
	<meta name="description" content="Guess One Piece crews daily!" />
</svelte:head>
<main class="flex flex-col items-center w-full pb-12 max-sm:w-screen gap-y-8">
	<h1 class="p-2 text-4xl font-bold text-center text-white rounded-md bg-opacity-35 text-shadow-1">
		Guess today's One Piece crew!
	</h1>
	{#if result}
		{@const guessIds = result.guesses.map(guess => guess.id)}
		{@const crewHasBeenGuessed = guessIds.includes(result.currentCrew.id)}

		<div class="w-full max-w-screen-sm px-4">
			<div class="overflow-hidden border border-black rounded-md">
				<img data-testid="current-crew" src={result.currentCrew.url} alt="Today's crew" />
			</div>
		</div>
		{#if !crewHasBeenGuessed}
			<GenericSearch
				{guessIds}
				{gettingNewData}
				getItemsFromQuery={getCrewsFromQuery}
				page="crew"
			/>
		{/if}
		{#if result.guesses.length > 0}
			<Crews guesses={result.guesses} currentCrew={result.currentCrew} />
		{/if}
		{#if crewHasBeenGuessed}
			<SuccessBox correctGuess={result.guesses[0]} page="crew" />
		{/if}
	{:else}
		<Loader2 class="text-white animate-spin" size={80} />
	{/if}
</main>
