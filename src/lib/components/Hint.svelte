<script lang="ts">
	type Props = {
		hint: string;
		category: string;
		numberOfGuesses: number;
		guessesToReveal: number;
	};

	let { hint, category, numberOfGuesses, guessesToReveal }: Props = $props();

	let showHint = $state(false);
	let guessesReached = $derived(() => numberOfGuesses > guessesToReveal - 1);
</script>

<div class="flex flex-col items-center gap-y-2">
	<button
		disabled={!guessesReached()}
		onclick={() => (showHint = !showHint)}
		class="text-white p-2 font-bold text-base rounded-md disabled:bg-red-light bg-green-primary"
	>
		{#if guessesReached()}
			{category} clue
		{:else}
			{@const remainingGuesses = guessesToReveal - numberOfGuesses}
			{@const triesText = remainingGuesses === 1 ? 'try' : 'tries'}
			{category} clue in {remainingGuesses}
			{triesText}
		{/if}
	</button>

	{#if showHint}
		<div class="text-black bg-white p-2 font-bold text-base rounded-md">{hint}</div>
	{/if}
</div>
