<script lang="ts">
	import { untrack } from 'svelte';
	import { Loader2 } from 'lucide-svelte';
	import Locations from '$lib/components/Locations.svelte';
	import Success from '$lib/components/Success.svelte';
	import { animateNewItem, getLocalImages } from '$lib/utils/helpers';
	import GenericSearch from '$lib/components/GenericSearch/index.svelte';
	import { getLocationsFromQuery } from '$lib/services/locationService.js';

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
				const guessesWithLocalImages = await getLocalImages(newResult.guesses);

				const currentLocationWithLocalImage = await getLocalImages([newResult.currentLocation]);

				result = {
					currentLocation: currentLocationWithLocalImage[0],
					guesses: guessesWithLocalImages,
				};
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

<main class="flex flex-col items-center w-full h-full max-sm:w-screen gap-y-8">
	<div class="p-2 text-4xl font-bold text-center text-white rounded-md bg-opacity-35 text-shadow-1">
		Guess today's One Piece location!
	</div>
	{#if result}
		{@const guessIds = result.guesses.map(guess => guess.id)}
		{@const locationHasBeenGuessed = guessIds.includes(result.currentLocation.id)}

		<div class="w-full max-w-screen-sm px-4">
			<img
				src={result.currentLocation.url}
				alt="Today's location"
				class="border border-black rounded-md"
			/>
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
			<Success correctGuess={result.guesses[0]} page="location" />
		{/if}
	{:else}
		<Loader2 class="text-white animate-spin" size={80} />
	{/if}
</main>
