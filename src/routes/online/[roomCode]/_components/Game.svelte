<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import Search from './Search/index.svelte';
	import { getCharactersFromQuery } from '$lib/services/characterService.js';
	import { getOnlineRoom } from '../_lib/online-room-context';
	import { formatBounty, formatHeight } from '$lib/utils/helpers';
	import type { Character } from '$lib/types/DatabaseTypes';

	type CharacterClue = {
		label: string;
		getValue: (character: Character) => string | number | string[] | null;
	};

	export const CHARACTER_CLUES = [
		{
			label: 'Gender',
			getValue: character => character.gender,
		},
		{
			label: 'Devil Fruit',
			getValue: character => character.devil_fruit,
		},
		{
			label: 'Haki',
			getValue: character => character.haki,
		},
		{
			label: 'Last Bounty',
			getValue: character => formatBounty(character.last_bounty),
		},
		{
			label: 'Height',
			getValue: character => formatHeight(character.height_m, character.height_cm),
		},
		{
			label: 'Origin',
			getValue: character => character.origin,
		},
		{
			label: 'First Arc',
			getValue: character => character.first_arc,
		},
		{
			label: 'Affiliation',
			getValue: character => character.affiliation,
		},
	] satisfies CharacterClue[];

	const getCharacterClue = (character: Character, guessNumber: number) => {
		const clue = CHARACTER_CLUES[guessNumber - 1];

		return {
			label: clue.label,
			value: clue.getValue(character),
		};
	};

	const room = getOnlineRoom();

	const currentRound = $derived(
		room.rounds.find(r => r.round_number === room.game.current_round_number),
	);
	const currentPlayerGuessesThisRound = $derived(
		room.guesses.filter(
			g => g.round_id === currentRound?.id && g.player_id === room.currentPlayer.id,
		),
	);

	const visibleClues = $derived.by(() => {
		if (!currentRound) return [];

		return Array.from({ length: currentRound.current_guess_number }, (_, i) =>
			getCharacterClue(currentRound.character, i + 1),
		).filter(clue => clue !== null);
	});

	// TODO: GRAB CHARACTER AND CHARACTER IMAGES WITH GUESSES | TO SHOW GUESSES OF PLAYER AND OTHER PLAYER GUESSES END OF ROUND
	// TODO: GRAB CHARACTER IMAGES WITH ROUND CHARACTER | TO SHOW CORRECT CHARACTER END OF ROUND
</script>

<div class="flex flex-col items-center gap-y-8 w-full">
	{#if currentRound}
		{#each visibleClues as clue, i (clue.label)}
			<div class:font-bold={i === visibleClues.length - 1}>
				{clue.label}: {clue.value}
			</div>
		{/each}
		{#if !currentPlayerGuessesThisRound.some(g => g.guess_number === currentRound?.current_guess_number)}
			<Search
				guessIds={room.guesses
					.filter(g => g.player_id === room.currentPlayer.id && g.round_id === currentRound?.id)
					.map(g => g.character_id)}
				roundId={currentRound?.id}
				guessNumber={currentRound?.current_guess_number}
			/>
		{/if}
		{#each currentPlayerGuessesThisRound as guess, i (`guess-${i}`)}
			<div>
				{guess.character_id}
			</div>
		{/each}
		<!-- SHOW PLAYERS IN A LINE, HIGHLIGHT THEM ONCE THEY HAVE GUESSED, ONCE EVERYONE GUESSED YOU CAN REVEAL THEIR ANSWERS AND THEN THE CORRECT ANSWER, CORRECT TURN GREEN, INCORRECT TURN RED -->
	{:else}
		<Loader2 class="text-white animate-spin size-20" />
	{/if}
</div>
