<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import Locations from '$lib/components/Locations.svelte';
	import Success from '$lib/components/Success.svelte';
	import { animateNewItem } from '$lib/utils/constants.js';
	import LocationSearch from '$lib/components/LocationSearch.svelte';

	type Result = Awaited<typeof data.pageData>;

	let { data } = $props();

	let result = $state<Result>();
	let gettingNewData = $state(false);

	$effect(() => {
		(async () => {
			try {
				const oldResult = result;

				gettingNewData = true;
				result = await data.pageData;
				gettingNewData = false;

				const firstIdChanged = oldResult && oldResult.guesses?.[0]?.id !== result?.guesses?.[0]?.id;

				if (firstIdChanged) {
					const playerHasWon = result?.currentLocation.id === result?.guesses?.[0]?.id;
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
			<LocationSearch {guessIds} {gettingNewData} />
		{/if}
		{#if result.guesses.length > 0}
			<Locations guesses={result.guesses} currentLocation={result.currentLocation} />
		{/if}
		{#if locationHasBeenGuessed}
			<Success correctGuess={result.guesses[0]} variant="location" />
		{/if}
	{:else}
		<Loader2 class="text-white animate-spin" size={80} />
	{/if}
</main>
