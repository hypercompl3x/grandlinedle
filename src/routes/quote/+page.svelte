<script lang="ts">
	import { untrack } from 'svelte';
	import { Loader2 } from 'lucide-svelte';
	import Quotes from '$lib/components/Quotes.svelte';
	import Success from '$lib/components/Success.svelte';
	import { animateNewItem, getLocalImages } from '$lib/utils/helpers';
	import GenericSearch from '$lib/components/GenericSearch/index.svelte';
	import { getCharactersFromQueryForQuote } from '$lib/services/quoteService.js';
	import type { CharacterWithImage } from '$lib/types/DatabaseTypes';

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

				const currentCharacterWithLocalImage = await getLocalImages([
					newResult.currentQuote.character,
				]);

				result = {
					currentQuote: {
						...newResult.currentQuote,
						character: currentCharacterWithLocalImage[0],
					},
					guesses: guessesWithLocalImages,
				};
				gettingNewData = false;

				const firstIdChanged = oldResult && oldResult.guesses?.[0]?.id !== result?.guesses?.[0]?.id;

				if (firstIdChanged) {
					const playerHasWon = result?.currentQuote.character.id === result?.guesses?.[0]?.id;
					await animateNewItem(playerHasWon, 'quote');
				}
			} catch (error) {
				console.error(error);
			}
		})();
	});
</script>

<main class="flex flex-col items-center w-full h-full max-sm:w-screen gap-y-8">
	<div
		class="p-2 text-4xl font-bold text-center text-white rounded-md bg-opacity-35 text-shadow-1"
		data-testid="quote-title"
	>
		Guess who said today's One Piece quote!
	</div>
	{#if result}
		{@const guessIds = result.guesses.map((guess: CharacterWithImage) => guess.id)}
		{@const quoteHasBeenGuessed = guessIds.includes(result.currentQuote.character.id)}

		<div class="w-full max-w-screen-sm px-4">
			<div
				class="p-6 text-2xl font-semibold text-center text-white bg-[#313131] border border-black rounded-md"
				data-testid="current-quote"
			>
				"{result.currentQuote.quote}"
			</div>
		</div>
		{#if !quoteHasBeenGuessed}
			<GenericSearch
				{guessIds}
				{gettingNewData}
				getItemsFromQuery={getCharactersFromQueryForQuote}
				page="quote"
			/>
		{/if}
		{#if result.guesses.length > 0}
			<Quotes guesses={result.guesses} currentCharacter={result.currentQuote.character} />
		{/if}
		{#if quoteHasBeenGuessed}
			<Success correctGuess={result.guesses[0]} page="quote" />
		{/if}
	{:else}
		<Loader2 class="text-white animate-spin" size={80} />
	{/if}
</main>
