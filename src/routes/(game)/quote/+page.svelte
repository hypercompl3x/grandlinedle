<script lang="ts">
	import { untrack } from 'svelte';
	import { Loader2 } from 'lucide-svelte';
	import GenericSearch from '$lib/components/GenericSearch/index.svelte';
	import SuccessBox from '$lib/components/SuccessBox.svelte';
	import QuoteCharacters from '$lib/components/QuoteCharacters.svelte';
	import Hint from '$lib/components/Hint.svelte';
	import { animateNewItem, formatBounty, preloadImage } from '$lib/utils/helpers.js';
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
				await Promise.all(newResult.guesses.map(i => preloadImage(i.url)));

				result = newResult;
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

<svelte:head>
	<title>Grandlinedle - Quote</title>
	<meta name="description" content="Guess One Piece quotes daily!" />
</svelte:head>
<main class="flex flex-col items-center w-full pb-12 max-sm:w-screen gap-y-8">
	<h1 class="p-2 text-4xl font-bold text-center text-white text-shadow-sm text-shadow-black">
		Guess who said today's One Piece quote!
	</h1>
	{#if result}
		{@const guessIds = result.guesses.map(guess => guess.id)}
		{@const quoteHasBeenGuessed = guessIds.includes(result.currentQuote.character_id)}

		{#if !quoteHasBeenGuessed}
			<div class="flex gap-x-8">
				<Hint
					category="Bounty"
					hint={formatBounty(result.currentQuote.bounty)}
					numberOfGuesses={guessIds.length}
					guessesToReveal={3}
				/>
				<Hint
					category="Affiliation"
					hint={result.currentQuote.affiliation}
					numberOfGuesses={guessIds.length}
					guessesToReveal={5}
				/>
			</div>
		{/if}
		<div
			class="p-2 mx-4 text-2xl font-semibold text-center text-white bg-black/20 rounded-md sm:text-3xl sm:p-6 text-shadow-sm"
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
