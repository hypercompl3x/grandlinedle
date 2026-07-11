<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import Search from '../Search/index.svelte';
	import { getOnlineRoom } from '../../_lib/online-room-context';
	import { formatBounty, formatHeight } from '$lib/utils/helpers';
	import type { Character } from '$lib/types/DatabaseTypes';
	import Timer from './Timer.svelte';
	import Button from '$lib/components/Button.svelte';
	import { MAX_GUESSES } from '$lib/utils/constants';
	import { advanceGameFromResults } from '$lib/remote/online.remote';

	type CharacterClue = {
		label: string;
		getValue: (character: Character) => string | number | string[] | null;
	};

	export const CHARACTER_CLUES = [
		{
			label: 'First Arc',
			getValue: character => character.first_arc,
		},
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

	const currentGuessGuesses = $derived.by(() => {
		const round = room.currentRound;

		if (!round) return [];

		return room.guesses.filter(
			guess => guess.round_id === round.id && guess.guess_number === round.current_guess_number,
		);
	});
	const currentPlayerGuessesThisRound = $derived(
		room.guesses.filter(
			g => g.round_id === room.currentRound?.id && g.player_id === room.currentPlayer.id,
		),
	);
	const playersWithCurrentGuess = $derived(
		room.players.map(p => ({
			...p,
			currentGuess: room.guesses.find(
				g =>
					g.round_id === room.currentRound?.id &&
					g.player_id === p.id &&
					g.guess_number === room.currentRound.current_guess_number,
			),
		})),
	);

	const visibleClues = $derived.by(() => {
		const currentRound = room.currentRound;
		if (!currentRound) return [];

		return Array.from({ length: currentRound.current_guess_number }, (_, i) =>
			getCharacterClue(currentRound.character, i + 1),
		).filter(clue => clue !== null);
	});

	const someoneCorrect = $derived.by(() => {
		const round = room.currentRound;

		if (!round) return false;

		return currentGuessGuesses.some(guess => guess.character_id === round.character_id);
	});

	const noMoreClues = $derived.by(() => {
		if (!room.currentRound) return false;

		return room.currentRound.current_guess_number >= MAX_GUESSES;
	});

	const isFinalRound = $derived(room.game.current_round_number >= room.game.number_of_rounds);

	let advancing = $state(false);

	const advanceFromResults = async () => {
		if (advancing) return;

		advancing = true;

		try {
			await advanceGameFromResults({
				gameId: room.game.id,
			});
		} catch (error) {
			console.error('Failed to advance from results:', error);
		} finally {
			advancing = false;
		}
	};
</script>

<div>{room.game.sub_status}</div>
<Timer />
{#if room.currentPlayer.is_host && room.game.sub_status === 'results' && (someoneCorrect || noMoreClues)}
	<Button type="button" onclick={advanceFromResults} submitting={advancing}>
		{isFinalRound ? 'End Game' : 'Next Round'}
	</Button>
{:else}
	Waiting for host...
{/if}
<div class="flex flex-col items-center gap-y-8 w-full">
	{#if room.currentRound}
		<div class="bg-red-dark text-white p-4">
			<img alt="Round character" src={room.currentRound.character.url} />
			<div>{room.currentRound.character.name}</div>
		</div>
		{#each visibleClues as clue, i (clue.label)}
			<div class:font-bold={i === visibleClues.length - 1}>
				{clue.label}: {clue.value}
			</div>
		{/each}
		{#if !currentPlayerGuessesThisRound.some(g => g.guess_number === room.currentRound?.current_guess_number)}
			<Search
				guessIds={currentPlayerGuessesThisRound.map(g => g.character_id)}
				roundId={room.currentRound?.id}
				guessNumber={room.currentRound?.current_guess_number}
			/>
		{/if}
		{#each currentPlayerGuessesThisRound as guess, i (`guess-${i}`)}
			<div>
				{guess.character_id}
			</div>
		{/each}
		{#each playersWithCurrentGuess as player, i (`player-${i}`)}
			<div>
				<div>{player.display_name}</div>
				<img alt="Player icon" src={player.url} />
				<div>Current Guess: {player.currentGuess?.character.name}</div>
			</div>
		{/each}
		<!-- SHOW PLAYERS IN A LINE, HIGHLIGHT THEM ONCE THEY HAVE GUESSED, ONCE EVERYONE GUESSED YOU CAN REVEAL THEIR ANSWERS AND THEN THE CORRECT ANSWER, CORRECT TURN GREEN, INCORRECT TURN RED -->
	{:else}
		<Loader2 class="text-white animate-spin size-20" />
	{/if}
</div>
