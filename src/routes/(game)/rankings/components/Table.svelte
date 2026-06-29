<script lang="ts">
	import type { PageData } from '../$types';
	import { Star } from 'lucide-svelte';
	import { NUMBER_OF_GAME_MODES } from '$lib/utils/constants';
	import { cn } from '$lib/utils/helpers';

	type Props = {
		leaderboard: Awaited<PageData['pageData']>['leaderboard'];
	};

	let { leaderboard }: Props = $props();
</script>

<div class="w-full px-4 max-sm:hidden">
	<div
		class="flex items-center w-full text-lg font-bold text-center bg-blue-primary text-white rounded-t-md h-14 md:text-xl"
	>
		<div class="flex-1">Position</div>
		<div class="flex-[1.5]">Player</div>
		<div class="flex-1">Classic</div>
		<div class="flex-1">Location</div>
		<div class="flex-1">Quote</div>
		<div class="flex-1">Crew</div>
	</div>
	{#each leaderboard as { id, player, classic, location, quote, crew, location_hard_mode }, index (`desktop-table-${id}`)}
		<div
			class={cn(
				'flex items-center w-full h-16 text-lg font-semibold text-center text-black bg-white md:text-2xl',
				{
					'rounded-b-md': index === leaderboard.length - 1,
				},
			)}
		>
			<div class="flex-1">
				#{index + 1}
			</div>
			<div class="truncate flex-[1.5] min-w-0">
				{player}
			</div>
			<div class="flex-1">
				{classic}
			</div>
			<div class="flex-1 flex justify-center">
				{#if location_hard_mode}
					<div class="relative inline-grid">
						<Star class="text-red-primary fill-red-primary size-10 md:size-12 text-shadow-sm" />

						<div class="absolute inset-0 grid place-items-center text-white">
							{location}
						</div>
					</div>
				{:else}
					{location}
				{/if}
			</div>
			<div class="flex-1">
				{quote}
			</div>
			<div class="flex-1">
				{crew}
			</div>
		</div>
	{/each}
</div>
<div class="w-full px-2 pb-6 space-y-2 sm:hidden">
	<div
		class="flex items-center w-full h-12 text-base font-bold text-center bg-white rounded-md shadow-lg"
	>
		<div class="basis-1/3">Position</div>
		<div class="basis-1/3">Player</div>
		<div class="basis-1/3">Avg Guesses</div>
	</div>
	{#each leaderboard as { id, player, classic, location, quote, crew }, index (`mobile-table-${id}`)}
		{@const averageGuesses =
			Math.round(((classic + location + quote + crew) / NUMBER_OF_GAME_MODES) * 10) / 10}
		<div
			class="flex items-center w-full h-12 text-sm font-semibold text-center text-white rounded-md shadow-lg bg-green-primary"
		>
			<div class="basis-1/3">
				#{index + 1}
			</div>
			<div class="truncate basis-1/3 grow-0">
				{player}
			</div>
			<div class="basis-1/3">
				{averageGuesses}
			</div>
		</div>
	{/each}
</div>
