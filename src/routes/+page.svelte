<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import Search from '$lib/components/Search.svelte';
	import CharacterTable from '$lib/components/CharacterTable/index.svelte';
	import Success from '$lib/components/Success.svelte';

	let { data } = $props();

	let result = $state<Awaited<typeof data.pageData>>();

	$effect(() => {
		(async () => {
			try {
				result = await data.pageData;
			} catch (error) {
				console.error(error);
			}
		})();
	});

	// TODO: have confetti when you get it correct and scroll down to the success message
	// TODO: animate new rows when they are guessed
	// TODO: deployment
</script>

<main class="flex flex-col items-center w-full h-full max-sm:w-screen gap-y-8">
	<div class="p-2 text-4xl font-bold text-center text-white rounded-md bg-opacity-35 text-shadow-1">
		Guess today's One Piece character!
	</div>
	{#if result}
		{@const guessIds = result.guesses.map(guess => guess.id)}
		{@const characterHasBeenGuessed = guessIds.includes(result.currentCharacter.id)}
		{#if !characterHasBeenGuessed}
			<Search {guessIds} />
		{/if}
		{#if result.guesses.length > 0}
			<CharacterTable guesses={result.guesses} currentCharacter={result.currentCharacter} />
		{/if}
		{#if characterHasBeenGuessed}
			<Success character={result.guesses[0]} />
		{/if}
	{:else}
		<Loader2 class="text-white animate-spin" size={80} />
	{/if}
</main>
