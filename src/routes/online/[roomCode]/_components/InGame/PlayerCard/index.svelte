<script lang="ts">
	import { X } from 'lucide-svelte';
	import { cn } from '$lib/utils/helpers';
	import type {
		OnlineGame,
		OnlinePlayer,
		OnlinePlayerWithCurrentGuess,
		OnlineRoundWithCharacter,
	} from '$lib/types/DatabaseTypes';
	import Pill from './Pill.svelte';

	type Props = {
		subStatus: OnlineGame['sub_status'];
		player: OnlinePlayerWithCurrentGuess;
		currentRoundCharacterId: OnlineRoundWithCharacter['character_id'];
		isOnline: boolean;
		currentPlayer: OnlinePlayer;
		kickingPlayerId: number | null;
		kickPlayer: () => void;
	};

	let {
		subStatus,
		player,
		currentRoundCharacterId,
		isOnline,
		currentPlayer,
		kickPlayer,
		kickingPlayerId,
	}: Props = $props();

	let isCorrect = $derived(
		player.currentGuess?.character_id === currentRoundCharacterId && subStatus === 'results',
	);
	let isWrong = $derived(
		player.currentGuess?.character_id !== currentRoundCharacterId && subStatus === 'results',
	);
</script>

<div class="flex flex-col items-center gap-y-2">
	<Pill
		hasGuessed={Boolean(player.currentGuess)}
		guessName={player.currentGuess?.character.name}
		{subStatus}
	/>
	<div class="flex items-stretch relative max-sm:flex-col">
		<img
			alt="Player icon"
			src={player.url}
			class={cn('sm:w-28 p-2 bg-grey-dark max-sm:rounded-t-md sm:rounded-l-md', {
				'bg-green-primary': isCorrect,
				'bg-red-medium-dark': isWrong,
			})}
		/>
		<p
			class={cn(
				'p-4 text-white font-bold text-3xl max-sm:rounded-b-md sm:rounded-r-md bg-grey flex items-center max-sm:justify-center',
				{
					'bg-green-light': isCorrect,
					'bg-red-light': isWrong,
				},
			)}
		>
			<span class:animate-pulse={!isOnline}>
				{#if player.is_host}👑{/if}
				{player.display_name}
			</span>
		</p>
		{#if currentPlayer.is_host && player.id !== currentPlayer.id}
			<button
				type="button"
				class="absolute -top-2 -right-2 rounded-full bg-white p-0.5 group/kick"
				onclick={kickPlayer}
				disabled={kickingPlayerId === player.id}
			>
				<X class="size-5 stroke-3 group-hover/kick:text-red-primary" />
			</button>
		{/if}
	</div>
</div>
