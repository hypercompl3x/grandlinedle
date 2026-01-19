<script lang="ts">
	import type { CharacterWithImage } from '$lib/types/DatabaseTypes';
	import { cn } from '$lib/utils/helpers';

	type Props = {
		currentCharacter: CharacterWithImage;
		guesses: CharacterWithImage[];
	};

	let { currentCharacter, guesses }: Props = $props();
</script>

<div class="px-4 pb-8 space-y-4">
	{#each guesses as character, i (`${character.id}-guess`)}
		<div
			id={`quote-${i}`}
			data-testid={`quote-guess-${character.name}`}
			class={cn(
				'p-4 leading-tight text-white border border-green-light rounded-md bg-green-primary flex items-center gap-x-4',
				{
					'bg-red-light border-red-dark': character.id !== currentCharacter.id,
				},
			)}
		>
			<img
				src={character.url}
				alt={character.name}
				class="w-40 border border-black rounded-md sm:w-52 grow-0"
			/>
			<div class="text-2xl font-bold">{character.name}</div>
		</div>
	{/each}
</div>
