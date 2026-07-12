<script lang="ts">
	import { X } from 'lucide-svelte';
	import { cn } from '$lib/utils/helpers';
	import type {
		OnlineGame,
		OnlinePlayer,
		OnlinePlayerWithCurrentGuess,
		OnlineRoundWithCharacter,
	} from '$lib/types/DatabaseTypes';

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
	let hasGuessed = $derived(Boolean(player.currentGuess));
</script>

<div class="flex flex-col items-center gap-y-2">
	{#if subStatus !== 'guessing'}
		<div
			class="min-h-8 rounded-full border-2 border-black/80 bg-white/90 px-3 py-1 text-center text-sm font-black shadow-sm text-black/80"
		>
			{player.currentGuess?.character.name || 'No Guess'}
		</div>
	{:else}
		<div
			class={cn(
				'min-h-8 rounded-full border-2 bg-white/90 px-3 py-1 text-center text-sm font-black shadow-sm',
				{
					'text-black/80 border-black/80': hasGuessed,
					'animate-pulse text-black/50 border-black/10': !hasGuessed,
				},
			)}
		>
			{hasGuessed ? '✓ Guessed' : 'Waiting...'}
		</div>
	{/if}
	<div class="flex items-center relative">
		<img
			alt="Player icon"
			src={player.url}
			class={cn('w-28 p-2 bg-grey-dark rounded-l-md', {
				'bg-green-primary': isCorrect,
				'bg-red-medium-dark': isWrong,
			})}
		/>
		<p
			class={cn('p-4 text-white font-bold text-3xl rounded-r-md bg-grey h-full flex items-center', {
				'bg-green-light': isCorrect,
				'bg-red-light': isWrong,
			})}
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
