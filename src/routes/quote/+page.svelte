<script lang="ts">
	import { untrack } from 'svelte';
	import { Loader2 } from 'lucide-svelte';
	import GenericSearch from '$lib/components/GenericSearch/index.svelte';
	import SuccessBox from '$lib/components/SuccessBox.svelte';
	import QuoteCharacters from '$lib/components/QuoteCharacters.svelte';
	import Hint from '$lib/components/Hint.svelte';
	import { animateNewItem, getLocalImages } from '$lib/utils/helpers.js';
	import { getCharactersFromQuery } from '$lib/services/characterService.js';

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

				result = {
					...newResult,
					guesses: guessesWithLocalImages,
				};
				gettingNewData = false;

				const firstIdChanged = oldResult && oldResult.guesses?.[0]?.id !== result?.guesses?.[0]?.id;

				if (firstIdChanged) {
					const playerHasWon = result?.currentQuote?.character_id === result?.guesses?.[0]?.id;
					await animateNewItem(playerHasWon, 'quote');
				}
			} catch (error) {
				console.error(error);
			}
		})();
	});
</script>

<main class="flex flex-col items-center w-full h-full max-sm:w-screen gap-y-8">
	<h1 class="p-2 text-4xl font-bold text-center text-white rounded-md bg-opacity-35 text-shadow-1">
		Guess who said today's One Piece quote!
	</h1>
	{#if result}
		{@const guessIds = result.guesses.map(guess => guess.id)}
		{@const quoteHasBeenGuessed = guessIds.includes(result.currentQuote.character_id)}

		{#if !quoteHasBeenGuessed}
			<Hint
				category="Affiliation"
				hint={result.currentQuote.affiliation}
				numberOfGuesses={guessIds.length}
			/>
		{/if}
		<div
			class="p-6 text-3xl font-semibold text-center text-white bg-black bg-opacity-50 rounded-md text-shadow-1"
		>
			"{result.currentQuote.quote}"
		</div>
		{#if !quoteHasBeenGuessed}
			<GenericSearch
				{guessIds}
				{gettingNewData}
				getItemsFromQuery={getCharactersFromQuery}
				page="quote"
			/>
		{/if}
		{#if result.guesses.length > 0}
			<QuoteCharacters guesses={result.guesses} currentQuote={result.currentQuote} />
		{/if}
		{#if quoteHasBeenGuessed}
			<SuccessBox correctGuess={result.guesses[0]} page="quote" />
		{/if}
	{:else}
		<Loader2 class="text-white animate-spin" size={80} />
	{/if}
</main>
