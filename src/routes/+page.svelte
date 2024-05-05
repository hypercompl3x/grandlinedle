<script lang="ts">
	import { tick } from 'svelte';
	import gsap, { Power2 } from 'gsap';
	import { Loader2 } from 'lucide-svelte';
	import Search from '$lib/components/Search.svelte';
	import CharacterTable from '$lib/components/CharacterTable/index.svelte';
	import Success from '$lib/components/Success.svelte';

	type Result = Awaited<typeof data.pageData>;

	let { data } = $props();

	let result = $state<Result>();
	let gettingNewData = $state(false);

	const animateNewRow = async (result: Result) => {
		await tick();

		const tl = gsap.timeline({
			onComplete: () => {
				const playerHasWon = result?.currentCharacter.id === result?.guesses?.[0]?.id;
				if (playerHasWon) {
					const successEl = document.getElementById(`success`);
					successEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			},
			defaults: { opacity: 0, ease: Power2.easeInOut, duration: 0.6 },
		});

		tl.from('#gender-0', {})
			.from('#affiliation-0', {})
			.from('#devil_fruit-0', {})
			.from('#haki-0', {})
			.from('#last_bounty-0', {})
			.from('#height-0', {})
			.from('#origin-0', {})
			.from('#first_saga-0', {});
	};

	$effect(() => {
		(async () => {
			try {
				const oldResult = result;

				gettingNewData = true;
				result = await data.pageData;
				gettingNewData = false;

				const firstIdChanged = oldResult && oldResult.guesses?.[0]?.id !== result?.guesses?.[0]?.id;

				if (firstIdChanged) {
					await animateNewRow(result);
				}
			} catch (error) {
				console.error(error);
			}
		})();
	});
</script>

<main class="flex flex-col items-center w-full h-full max-sm:w-screen gap-y-8">
	<div class="p-2 text-4xl font-bold text-center text-white rounded-md bg-opacity-35 text-shadow-1">
		Guess today's One Piece character!
	</div>
	{#if result}
		{@const guessIds = result.guesses.map(guess => guess.id)}
		{@const characterHasBeenGuessed = guessIds.includes(result.currentCharacter.id)}

		{#if !characterHasBeenGuessed}
			<Search {guessIds} {gettingNewData} />
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
