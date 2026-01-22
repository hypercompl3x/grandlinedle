<script lang="ts">
	type Props = {
		hint: string;
		category: string;
		numberOfGuesses: number;
	};

	let { hint, category, numberOfGuesses }: Props = $props();

	let showHint = $state(false);
	let guessesReached = $derived(() => numberOfGuesses > 2);
</script>

<div class="flex flex-col items-center gap-y-2">
	<button
		disabled={!guessesReached()}
		onclick={() => (showHint = !showHint)}
		class="bg-blue-dark text-white p-1.5 font-bold text-lg rounded-md disabled:bg-grey"
	>
		{#if guessesReached()}
			{category} clue
		{:else}
			{@const remainingGuesses = 3 - numberOfGuesses}
			{@const triesText = remainingGuesses === 1 ? 'try' : 'tries'}
			{category} clue in {remainingGuesses}
			{triesText}
		{/if}
	</button>

	{#if showHint}
		<div class="text-black bg-white p-1.5 font-bold text-lg rounded-md">{hint}</div>
	{/if}
</div>
