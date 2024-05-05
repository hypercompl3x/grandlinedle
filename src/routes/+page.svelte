<script lang="ts">
	import Search from '$lib/components/Search.svelte';
	import CharacterTable from '$lib/components/CharacterTable/index.svelte';

	let { data } = $props();

	let guessIds = $derived(data.guesses.map(guess => guess.id));
	// TODO: create a success component below with success message, timer till next character, timezone
	// TODO: have confetti when you get it correct
</script>

<main class="flex flex-col items-center w-full h-full max-sm:w-screen gap-y-8">
	<div class="p-2 text-4xl font-bold text-center text-white rounded-md bg-opacity-35 text-shadow-1">
		Guess today's One Piece character!
	</div>
	{#if !guessIds.includes(data.currentCharacter.id)}
		<Search {guessIds} />
	{/if}
	<CharacterTable guesses={data.guesses} currentCharacter={data.currentCharacter} />
</main>
