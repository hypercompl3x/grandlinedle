<script lang="ts">
	import type { CharacterWithImage, Quote } from '$lib/types/DatabaseTypes';
	import { cn } from '$lib/utils/helpers';

	type Props = {
		currentQuote: Quote;
		guesses: CharacterWithImage[];
	};

	let { currentQuote, guesses }: Props = $props();
</script>

<div class="px-4 pb-8 space-y-4">
	{#each guesses as character, i (`${character.id}-guess`)}
		<div
			id={`quotecharacter-${i}`}
			class={cn(
				'p-4 leading-tight text-white border border-green-light rounded-md bg-green-primary flex max-sm:flex-col items-center gap-4',
				{
					'bg-red-light border-red-dark': character.id !== currentQuote.character_id,
				},
			)}
		>
			<img
				src={character.url}
				alt={character.name}
				class="w-20 border border-black rounded-md sm:w-24 grow-0"
			/>
			<div class="text-2xl font-bold">{character.name}</div>
		</div>
	{/each}
</div>
