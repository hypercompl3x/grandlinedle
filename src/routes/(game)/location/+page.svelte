<script lang="ts">
	import { untrack } from 'svelte';
	import type { PageData } from './$types';
	import { Loader2 } from 'lucide-svelte';
	import Locations from './components/Locations.svelte';
	import HardModeSwitch from './components/HardModeSwitch.svelte';
	import SuccessBox from '$lib/components/SuccessBox.svelte';
	import GenericSearch from '$lib/components/GenericSearch/index.svelte';
	import { getLocationsFromQuery } from './services';
	import { animateNewItem, preloadImage } from '$lib/utils/helpers';

	type Result = Awaited<PageData['pageData']>;

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
					preloadImage(newResult.currentLocation.url),
				]);

				result = newResult;
				gettingNewData = false;

				const firstIdChanged = oldResult && oldResult.guesses?.[0]?.id !== result?.guesses?.[0]?.id;

				if (firstIdChanged) {
					const playerHasWon = result?.currentLocation?.id === result?.guesses?.[0]?.id;
					await animateNewItem(playerHasWon, 'location');
				}
			} catch (error) {
				console.error(error);
			}
		})();
	});
</script>

<svelte:head>
	<title>Grandlinedle - Location</title>
	<meta name="description" content="Guess One Piece locations daily!" />
</svelte:head>
<main class="flex flex-col items-center w-full pb-12 max-sm:w-screen gap-y-8">
	<h1 class="p-2 text-4xl font-bold text-center text-white text-shadow-sm text-shadow-black">
		Guess today's One Piece location!
	</h1>
	{#if result}
		{@const guessIds = result.guesses.map(guess => guess.id)}
		{@const locationHasBeenGuessed = guessIds.includes(result.currentLocation.id)}

		<div class="w-full max-w-(--breakpoint-sm) px-4 space-y-2">
			{#if !locationHasBeenGuessed}
				<HardModeSwitch checked={result.isHardMode} />
			{/if}
			<div class="overflow-hidden shadow-sm rounded-md">
				<img
					data-testid="current-location"
					src={result.currentLocation.url}
					alt="Today's location"
				/>
			</div>
		</div>
		{#if !locationHasBeenGuessed}
			<GenericSearch
				{guessIds}
				{gettingNewData}
				getItemsFromQuery={getLocationsFromQuery}
				page="location"
			/>
		{/if}
		{#if result.guesses.length > 0}
			<Locations guesses={result.guesses} currentLocation={result.currentLocation} />
		{/if}
		{#if locationHasBeenGuessed}
			<SuccessBox correctGuess={result.guesses[0]} page="location" />
		{/if}
	{:else}
		<Loader2 class="text-white animate-spin" size={80} />
	{/if}
</main>
