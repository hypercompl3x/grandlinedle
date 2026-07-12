<script lang="ts">
	import { cn } from '$lib/utils/helpers';
	import type {
		OnlineGame,
		OnlinePlayerWithCurrentGuess,
		OnlineRoundWithCharacter,
	} from '$lib/types/DatabaseTypes';

	type Props = {
		subStatus: OnlineGame['sub_status'];
		player: OnlinePlayerWithCurrentGuess;
		currentRoundCharacterId: OnlineRoundWithCharacter['character_id'];
	};

	let { subStatus, player, currentRoundCharacterId }: Props = $props();

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
	<div
		class={cn('flex bg-grey rounded-md overflow-hidden items-center', {
			'bg-green-light': isCorrect,
			'bg-red-light': isWrong,
		})}
	>
		<img
			alt="Player icon"
			src={player.url}
			class={cn('w-28 p-2 bg-grey-dark', {
				'bg-green-primary': isCorrect,
				'bg-red-medium-dark': isWrong,
			})}
		/>
		<p class="p-4 text-white font-bold text-3xl">
			{#if player.is_host}👑{/if}
			{player.display_name}
		</p>
	</div>
</div>
