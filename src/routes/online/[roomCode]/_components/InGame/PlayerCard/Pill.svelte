<script lang="ts">
	import { cn } from '$lib/utils/helpers';
	import type { Character, OnlineGame } from '$lib/types/DatabaseTypes';

	type Props = {
		subStatus: OnlineGame['sub_status'];
		hasGuessed: boolean;
		guessName: Character['name'] | undefined;
	};

	let { hasGuessed, subStatus, guessName }: Props = $props();
</script>

{#if subStatus !== 'guessing'}
	<div
		class="min-h-8 rounded-full border-2 border-black/80 bg-white/90 px-3 py-1 text-center text-sm font-black shadow-sm text-black/80"
	>
		{guessName || 'No Guess'}
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
