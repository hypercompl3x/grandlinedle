<script lang="ts">
	import { untrack } from 'svelte';
	import { Loader2 } from 'lucide-svelte';
	import CharacterTable from '$lib/components/CharacterTable/index.svelte';
	import Success from '$lib/components/Success.svelte';
	import { animateNewItem, getLocalImages } from '$lib/utils/helpers';
	import GenericSearch from '$lib/components/GenericSearch/index.svelte';
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

				result = { ...newResult, guesses: guessesWithLocalImages };
				gettingNewData = false;

				const firstIdChanged = oldResult && oldResult.guesses?.[0]?.id !== result?.guesses?.[0]?.id;

				if (firstIdChanged) {
					const playerHasWon = result?.currentCharacter?.id === result?.guesses?.[0]?.id;
					await animateNewItem(playerHasWon, 'character');
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
		data-testid="character-title"
	>
		Guess today's One Piece character!
	</div>
	{#if result}
		{@const guessIds = result.guesses.map(guess => guess.id)}
		{@const characterHasBeenGuessed = guessIds.includes(result.currentCharacter.id)}

		{#if !characterHasBeenGuessed}
			<GenericSearch
				{guessIds}
				{gettingNewData}
				getItemsFromQuery={getCharactersFromQuery}
				page="character"
			/>
		{/if}
		{#if result.guesses.length > 0}
			<CharacterTable guesses={result.guesses} currentCharacter={result.currentCharacter} />
		{/if}
		{#if characterHasBeenGuessed}
			<Success correctGuess={result.guesses[0]} page="character" />
		{/if}
	{:else}
		<Loader2 class="text-white animate-spin" size={80} />
	{/if}
</main>
