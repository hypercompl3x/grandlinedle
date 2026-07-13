<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { resetGameToLobby } from '$lib/remote/online.remote';
	import { getOnlineRoom } from '../_lib/online-room-context';
	import { cn } from '$lib/utils/helpers';

	const room = getOnlineRoom();

	let playersRanked = $derived.by(() => {
		const players = room.players
			.map(player => {
				const score = room.guesses.filter(guess => {
					const round = room.rounds.find(round => round.id === guess.round_id);

					return guess.player_id === player.id && round?.character_id === guess.character_id;
				}).length;

				return {
					id: player.id,
					name: player.display_name,
					url: player.url,
					score,
				};
			})
			.toSorted((a, b) => b.score - a.score);

		let previousScore: number | null = null;
		let previousPlace = 0;

		return players.map((player, i) => {
			const place = player.score === previousScore ? previousPlace : i + 1;

			previousScore = player.score;
			previousPlace = place;

			return {
				...player,
				place,
			};
		});
	});
	let clearWinner = $derived(playersRanked.length === 1 || playersRanked[0].score > playersRanked[1].score);

	let resetting = $state(false);

	const resetGame = async () => {
		resetting = true;

		try {
			await resetGameToLobby({ gameId: room.game.id });
		} finally {
			resetting = false;
		}
	};
</script>

<div class="space-y-8 max-w-md w-full px-4">
	<div
		class="rounded-xl border-2 border-black/20 bg-white/90 p-5 text-center shadow-lg backdrop-blur-sm"
	>
		<p class="text-sm font-bold uppercase tracking-widest text-red-primary">Game Results</p>

		{#if clearWinner}
			<h1 class="mt-1 text-3xl font-black text-blue-primary sm:text-5xl">
				{const winnerText = $derived(playersRanked[0].id === room.currentPlayer.id ? "You win!" : `${playersRanked[0].name} wins!`)}
				{winnerText}
			</h1>
		{:else}
			<h1 class="mt-1 text-3xl font-black text-blue-primary sm:text-5xl">It's a draw</h1>
		{/if}
	</div>
	<div
		class="rounded-xl border-2 border-black/20 bg-white/85 p-4 shadow-lg sm:p-6"
	>
		<div class="flex items-end justify-center gap-2 sm:gap-5">
			{#each playersRanked.slice(0, 3).length > 2 ? [playersRanked[1], playersRanked[0], playersRanked[2]] : playersRanked.slice(0, 3) as {name, place, score, url},i (`player-${place}-${i}`)}
				{const player = $derived(score === playersRanked[0]?.score ?
					{height: 'h-32', bg: 'bg-yellow-primary', border: "border-yellow-primary"} :
					score === playersRanked[1]?.score ?
					{height: 'h-22', bg: 'bg-grey/50', border: "border-grey/50"} :
					{height: 'h-14', bg: 'bg-brown', border: "border-brown"}
				)}
				{const label = $derived(place === 1 ? "1st" : place === 2 ? "2nd" : "3rd")}
				<div class="flex min-w-0 flex-1 flex-col items-center">
						<div
							class={cn('relative mb-2 flex size-16 items-center justify-center rounded-full border-4 bg-white shadow-md sm:size-20',	player.border)}
						>
							<img
									src={url}
									alt={name}
									class="size-full rounded-full object-cover p-1"
								/>
						</div>
						<p
							class="max-w-full truncate text-center text-sm font-black text-blue-primary sm:text-base"
						>
							{name}
						</p>
						<p class="mb-2 text-xs font-bold text-black/60">
							{score} correct
						</p>
					<div
						class={cn(
							'flex w-full items-center justify-center rounded-t-lg border-2 border-b-0 border-black/20 px-2 shadow-inner text-white',
							player.height,
							player.bg,
						)}
					>
						<span class="text-2xl font-black sm:text-4xl">{label}</span>
					</div>
				</div>
			{/each}
		</div>
		<div class="h-0.5 bg-black/40"></div>
	</div>
	{#if playersRanked.length > 3}
		<div
			class="rounded-xl border-2 border-black/20 bg-white/90 p-4 shadow-lg backdrop-blur-sm sm:p-5"
		>
			<h2 class="mb-3 text-xl font-black text-blue-primary text-center">Remaining Players</h2>

			<div class="flex flex-col gap-2">
				{#each playersRanked.slice(3) as {name, score, url, place} (`player-${place}`)}
					<div
						class="flex items-center gap-3 rounded-lg border-2 border-black/10 bg-white px-3 py-2 shadow-sm"
					>
						<div class="w-8 text-center text-lg font-black text-red-primary">
							#{place}
						</div>
							<img
								src={url}
								alt={name}
								class="size-10 rounded-full border-2 border-black/10 bg-white object-cover p-0.5"
							/>
						<div class="min-w-0 flex-1">
							<p class="truncate font-black text-blue-primary">{name}</p>
						</div>
						<div class="rounded-md bg-black/5 px-3 py-1 text-sm font-black text-black/70">
							{score} correct
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
	{#if room.currentPlayer.is_host}
		<Button type="button" onclick={resetGame} submitting={resetting} class="w-full">Lobby</Button>
	{:else}
		<p class="text-lg font-medium text-center">Waiting for host to return to lobby...</p>
	{/if}
	<Button
		type="button"
		onclick={() => room.leave()}
		submitting={room.leaving}
		disabled={resetting}
		class="from-red-primary to-red-medium-dark"
	>
		Leave
	</Button>
</div>