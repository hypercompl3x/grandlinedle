<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import Timer from './Timer.svelte';
	import Search from './Search/index.svelte';
	import PlayerCard from './PlayerCard/index.svelte';
	import CharacterCard from './CharacterCard.svelte';
	import { getOnlineRoom } from '$lib/context/online-room/online-room-context';
	import { getSounds } from '$lib/context/sounds/sounds-context';
	import { advanceGameFromResults } from '$lib/remote/online.remote';
	import { cn, formatBounty, formatHeight } from '$lib/utils/helpers';
	import { HAKI_MAP, MAX_GUESSES } from '$lib/utils/constants';
	import type { Character } from '$lib/types/DatabaseTypes';
	import X from '$lib/assets/x.png';
	import Berry from '$lib/assets/berry-black.png';

	const room = getOnlineRoom();
	const sounds = getSounds();

	let lastResultSoundKey = $state<string | null>(null);

	$effect(() => {
		if (room.game.sub_status !== 'results') return;
		if (!room.currentRound) return;
		if (!room.game.sub_status_started_at) return;

		const resultSoundKey = `${room.currentRound.id}-${room.game.sub_status_started_at}`;

		if (lastResultSoundKey === resultSoundKey) return;

		lastResultSoundKey = resultSoundKey;

		if (currentPlayerCurrentGuess?.character_id === room.currentRound.character_id) {
			sounds.play('haki');
			return;
		}

		if (currentPlayerCurrentGuess) {
			sounds.play('goofy');
			return;
		}

		sounds.play('shock');
	});

	type CluePart =
		| {
				type: 'text';
				text: string;
		  }
		| {
				type: 'image';
				src: string;
				alt: string;
				class: string;
		  };

	type CharacterClue = {
		label: string;
		getValue: (character: Character) => CluePart[];
	};

	export const CHARACTER_CLUES = [
		{
			label: 'First Arc',
			getValue: character => [{ type: 'text', text: character.first_arc }],
		},
		{
			label: 'Gender',
			getValue: character => [{ type: 'text', text: character.gender }],
		},
		{
			label: 'Devil Fruit',
			getValue: character => [{ type: 'text', text: character.devil_fruit }],
		},
		{
			label: 'Haki',
			getValue: character =>
				character.haki.length > 0
					? character.haki.map(haki => ({
							type: 'image',
							src: HAKI_MAP[haki],
							alt: `${haki} Haki`,
							class: 'w-7',
						}))
					: [
							{
								type: 'image',
								src: X,
								alt: 'No Haki',
								class: 'w-5',
							},
						],
		},
		{
			label: 'Last Bounty',
			getValue: character => [
				{
					type: 'image',
					src: Berry,
					alt: 'Berry',
					class: 'w-3.5 translate-y-px',
				},
				{
					type: 'text',
					text: formatBounty(character.last_bounty),
				},
			],
		},
		{
			label: 'Height',
			getValue: character => [
				{
					type: 'text',
					text: formatHeight(character.height_m, character.height_cm),
				},
			],
		},
		{
			label: 'Origin',
			getValue: character => [{ type: 'text', text: character.origin }],
		},
		{
			label: 'Affiliation',
			getValue: character => [{ type: 'text', text: character.affiliation }],
		},
	] satisfies CharacterClue[];

	const getCharacterClue = (character: Character, guessNumber: number) => {
		const clue = CHARACTER_CLUES[guessNumber - 1];

		return {
			label: clue.label,
			value: clue.getValue(character),
		};
	};

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
	const currentPlayerCurrentGuess = $derived(
		currentPlayerGuessesThisRound.find(
			g => g.guess_number === room.currentRound?.current_guess_number,
		),
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

{#if room.currentRound}
	<div class="w-full gap-y-8 flex flex-col items-center px-4 pb-12">
		<div class="w-full max-w-md shadow-sm text-center rounded-md">
			<div class="bg-blue-primary p-3 text-white rounded-t-md">
				<p class="text-sm font-black uppercase tracking-widest">
					Round {room.game.current_round_number} of {room.game.number_of_rounds}
				</p>
				{const gameStatus = $derived(
					room.game.sub_status === 'guessing'
						? 'Guess'
						: room.game.sub_status === 'revealing'
							? 'Reveal Answers'
							: 'Results',
				)}
				<p class="text-2xl font-black">{gameStatus}</p>
			</div>
			<div class="p-5 space-y-5 bg-white rounded-b-md">
				<Timer />
				<div class="w-full bg-white rounded-md overflow-hidden border-2 border-black/15 shadow-sm">
					<div
						class="flex items-center justify-center text-lg font-bold text-center bg-blue-primary text-white h-12 md:text-xl w-full"
					>
						Clues
					</div>
					<div class="divide-y divide-black/10">
						{#each visibleClues as clue, i (`clue-${i}`)}
							<div
								class="flex items-center justify-center text-base sm:text-lg text-center bg-white text-black h-12 md:text-xl w-full gap-x-2 overflow-hidden"
							>
								<span class="font-bold">{clue.label}:</span>
								<span
									class={cn('font-medium flex items-center gap-x-1', {
										'max-sm:text-sm': clue.value.some(
											v => v.type === 'text' && v.text.split(' ').some(w => w.length > 10),
										),
									})}
								>
									{#each clue.value as value, j (`clue-part-${i}-${j}`)}
										{#if value.type === 'text'}
											{value.text}
										{:else}
											<img src={value.src} alt={value.alt} class={value.class} />
										{/if}
									{/each}
								</span>
							</div>
						{/each}
					</div>
				</div>
				<div class="w-full rounded-lg border-2 border-black/10 bg-black/5 px-3 py-3 text-center">
					<p class="text-xs font-black uppercase tracking-widest text-black/50">Your Guesses</p>
					{#if currentPlayerGuessesThisRound.length > 0}
						<div class="mt-1 flex flex-wrap justify-center gap-x-2 gap-y-1">
							{#each currentPlayerGuessesThisRound as guess, i (`guess-${i}`)}
								<span class="font-bold text-blue-primary">
									{guess.character.name}{i < currentPlayerGuessesThisRound.length - 1 ? ',' : ''}
								</span>
							{/each}
						</div>
					{:else}
						<p class="mt-1 font-semibold text-black/70">No guesses yet</p>
					{/if}
				</div>
				{#if !currentPlayerGuessesThisRound.some(g => g.guess_number === room.currentRound?.current_guess_number) && room.game.sub_status === 'guessing'}
					<Search
						guessIds={currentPlayerGuessesThisRound.map(g => g.character_id)}
						roundId={room.currentRound.id}
						guessNumber={room.currentRound.current_guess_number}
					/>
				{/if}
				{#if !currentPlayerCurrentGuess && room.game.sub_status !== 'guessing'}
					<div
						class={cn(
							'p-4 bg-red-light text-xs font-black uppercase tracking-[0.15em] text-white w-full rounded-lg border-2 border-black/15 text-center shadow-sm',
							{
								'bg-grey': room.game.sub_status === 'revealing',
							},
						)}
					>
						No Guess
					</div>
				{/if}
				{#if !!currentPlayerCurrentGuess && room.game.sub_status === 'results' && currentPlayerCurrentGuess?.character_id !== room.currentRound.character_id}
					<CharacterCard
						title="Your Guess"
						name={currentPlayerCurrentGuess.character.name}
						url={currentPlayerCurrentGuess.character.url}
						variant="incorrectGuess"
					/>
				{/if}
				{#if !!currentPlayerCurrentGuess && room.game.sub_status !== 'results'}
					<CharacterCard
						title="Your Guess"
						name={currentPlayerCurrentGuess.character.name}
						url={currentPlayerCurrentGuess.character.url}
						variant="guess"
					/>
				{/if}
				{#if room.game.sub_status === 'results' && (someoneCorrect || noMoreClues)}
					<CharacterCard
						title={currentPlayerCurrentGuess?.character_id === room.currentRound.character_id
							? 'Your Guess'
							: 'Correct Character'}
						name={room.currentRound.character.name}
						url={room.currentRound.character.url}
						variant="roundCharacter"
					/>
				{/if}
			</div>
		</div>
		{const crewMembers = $derived(
			playersWithCurrentGuess.filter(p => p.id !== room.currentPlayer.id),
		)}
		{#if crewMembers.length > 0}
			<div class="space-y-4">
				<p class="p-2 text-4xl font-bold text-center text-white text-shadow-sm text-shadow-black">
					Crew Members
				</p>
				<div class="flex flex-wrap gap-8 justify-center">
					{#each crewMembers as player (`player-${player.id}`)}
						{const isOnline = $derived(room.isPlayerOnline(player.id))}
						<PlayerCard
							subStatus={room.game.sub_status}
							currentRoundCharacterId={room.currentRound.character_id}
							currentPlayer={room.currentPlayer}
							kickingPlayerId={room.kickingPlayerId}
							kickPlayer={() => room.kickPlayer(player.id)}
							{player}
							{isOnline}
						/>
					{/each}
				</div>
			</div>
		{/if}
		{#if room.game.sub_status === 'results' && (someoneCorrect || noMoreClues)}
			{#if room.currentPlayer.is_host}
				<Button
					type="button"
					onclick={advanceFromResults}
					submitting={advancing}
					class="max-w-96 w-full"
				>
					{isFinalRound ? 'View Final Results' : 'Next Round'}
				</Button>
			{:else}
				<p class="text-lg font-medium">Waiting for host to continue...</p>
			{/if}
		{/if}
	</div>
{:else}
	<Loader2 class="text-white animate-spin size-20" />
{/if}
