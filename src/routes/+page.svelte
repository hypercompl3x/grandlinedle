<script lang="ts">
	import Search from '$lib/components/Search.svelte';
	import CharacterTable from '$lib/components/CharacterTable/index.svelte';
	import Success from '$lib/components/Success.svelte';

	let { data } = $props();

	let guessIds = $derived(data.guesses.map(guess => guess.id));
	let characterHasBeenGuessed = $derived(guessIds.includes(data.currentCharacter.id));
	// TODO: have confetti when you get it correct and scroll down to the success message
	// TODO: animate new rows when they are guessed
</script>

<main class="flex flex-col items-center w-full h-full max-sm:w-screen gap-y-8">
	<div class="p-2 text-4xl font-bold text-center text-white rounded-md bg-opacity-35 text-shadow-1">
		Guess today's One Piece character!
	</div>
	{#if !characterHasBeenGuessed}
		<Search {guessIds} />
	{/if}
	{#if data.guesses.length > 0}
		<CharacterTable guesses={data.guesses} currentCharacter={data.currentCharacter} />
	{/if}
	{#if characterHasBeenGuessed}
		<Success character={data.guesses[0]} />
	{/if}
</main>
