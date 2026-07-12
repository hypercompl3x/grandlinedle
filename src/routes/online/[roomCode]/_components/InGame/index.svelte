<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import Search from '../Search/index.svelte';
	import { getOnlineRoom } from '../../_lib/online-room-context';
	import { cn, formatBounty, formatHeight } from '$lib/utils/helpers';
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

	// TODO: ADD PRESENCE AND HANDLE DISCONNECTS ACCORDINGLY
	// TODO: HANDLE TRANSFER OF HOST WHEN LEAVING/DISCONNECTING
</script>

{#if room.currentRound}
	<div class="w-full gap-y-8 flex flex-col items-center px-4">
		<Timer />
		<div class="w-full max-w-96">
			<div
				class="flex items-center justify-center text-lg font-bold text-center bg-blue-primary text-white rounded-t-md h-12 md:text-xl w-full"
			>
				Clues
			</div>
			{#each visibleClues as clue, i (clue.label)}
				<div
					class={cn(
						'flex items-center justify-center text-lg text-center bg-white text-black rounded-t-md h-12 md:text-xl w-full gap-x-1',
						{
							'rounded-b-md': i === visibleClues.length - 1,
						},
					)}
				>
					<span class="font-bold">{clue.label}:</span>
					<span class="font-medium">{clue.value}</span>
				</div>
			{/each}
		</div>
		<div class="flex flex-col items-center gap-y-2 w-full max-w-96">
			<div class="flex gap-x-2 flex-wrap">
				<span class="font-semibold">Guesses Made:</span>
				{#each currentPlayerGuessesThisRound as guess, i (`guess-${i}`)}
					{const characterWithComma = $derived(`${guess.character.name}${i < currentPlayerGuessesThisRound.length - 1 ? "," : ""}`)}
					<span class="font-medium">
						{characterWithComma}
					</span>
				{/each}
			</div>
			{#if !currentPlayerGuessesThisRound.some(g => g.guess_number === room.currentRound?.current_guess_number) && room.game.sub_status === "guessing"}
				<Search
					guessIds={currentPlayerGuessesThisRound.map(g => g.character_id)}
					roundId={room.currentRound.id}
					guessNumber={room.currentRound.current_guess_number}
				/>
			{/if}
		</div>
		<div class="flex flex-wrap gap-8 justify-center">
			{#each playersWithCurrentGuess as player, i (`player-${i}`)}
				<div class="space-y-1">
					{#if room.game.sub_status !== "guessing"}
						<p class="text-center text-lg font-semibold">{player.currentGuess?.character.name || "No Guess Made"}</p>
					{/if}
					<div class={cn("flex bg-grey rounded-md overflow-hidden items-center w-fit", {
						"bg-green-light": player.currentGuess?.character_id === room.currentRound.character_id && room.game.sub_status === "results",
						"bg-red-light": player.currentGuess?.character_id !== room.currentRound.character_id && room.game.sub_status === "results",
					})}>
						<img alt="Player icon" src={player.url} class={cn("w-28 p-2 bg-grey-dark", {
							"bg-green-primary": player.currentGuess?.character_id === room.currentRound.character_id && room.game.sub_status === "results",
							"bg-red-medium-dark": player.currentGuess?.character_id !== room.currentRound.character_id && room.game.sub_status === "results"
						})} />
						<p class="p-4 text-white font-bold text-3xl">
							{#if player.is_host}👑{/if}
							{player.display_name}
						</p>
					</div>
				</div>
			{/each}
		</div>
		{#if room.game.sub_status === 'results' && (someoneCorrect || noMoreClues)}
			{#if room.currentPlayer.is_host}
				<Button type="button" onclick={advanceFromResults} submitting={advancing} class="max-w-96 w-full">
					{isFinalRound ? 'See Results' : 'Next Round'}
				</Button>
			{:else}
				<p class="text-lg font-medium">
					Waiting for host to continue...
				</p>
			{/if}
		{/if}
	</div>
{:else}
	<Loader2 class="text-white animate-spin size-20" />
{/if}


