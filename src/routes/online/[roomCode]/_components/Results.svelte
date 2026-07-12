<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { resetGameToLobby } from '$lib/remote/online.remote';
	import { getOnlineRoom } from '../_lib/online-room-context';

	const room = getOnlineRoom();

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

<div class="space-y-8 max-w-96 w-full text-center">
	{#if room.currentPlayer.is_host}
		<Button type="button" onclick={resetGame} submitting={resetting} class="max-w-96 w-full">
			Lobby
		</Button>
	{:else}
		<p class="text-lg font-medium">Waiting for host to return to lobby...</p>
	{/if}
	<Button
		type="button"
		onclick={() => room.leave()}
		submitting={room.leaving}
		disabled={resetting}
		class="from-grey to-grey-dark"
	>
		Leave
	</Button>
</div>

<!-- <script lang="ts">
	import { getOnlineRoom } from '../_lib/online-room-context';
	import Button from '$lib/components/Button.svelte';

	const USE_FAKE_RESULTS = true;

	const room = getOnlineRoom();

	const rankedPlayers = $derived.by(() => {
		if (USE_FAKE_RESULTS) {
			const basePlayer = room.players[0];

			return [
				{ ...basePlayer, id: -1, display_name: 'Luffy', score: 8, totalGuesses: 10 },
				{ ...basePlayer, id: -2, display_name: 'Zoro', score: 7, totalGuesses: 11 },
				{ ...basePlayer, id: -3, display_name: 'Nami', score: 6, totalGuesses: 12 },
				{ ...basePlayer, id: -4, display_name: 'Sanji', score: 5, totalGuesses: 13 },
				{ ...basePlayer, id: -5, display_name: 'Robin', score: 4, totalGuesses: 14 },
				{ ...basePlayer, id: -6, display_name: 'Franky', score: 3, totalGuesses: 15 },
				{ ...basePlayer, id: -7, display_name: 'Brook', score: 2, totalGuesses: 16 },
				{ ...basePlayer, id: -8, display_name: 'Usopp', score: 1, totalGuesses: 17 },
			];
		}

		return room.players
			.map(player => {
				const correctGuesses = room.guesses.filter(guess => {
					const round = room.rounds.find(round => round.id === guess.round_id);

					return guess.player_id === player.id && round?.character_id === guess.character_id;
				}).length;

				const totalGuesses = room.guesses.filter(guess => guess.player_id === player.id).length;

				return {
					...player,
					score: correctGuesses,
					totalGuesses,
				};
			})
			.toSorted((a, b) => {
				if (b.score !== a.score) return b.score - a.score;
				return a.totalGuesses - b.totalGuesses;
			});
	});
	const first = $derived(rankedPlayers[0]);
	const second = $derived(rankedPlayers[1]);
	const third = $derived(rankedPlayers[2]);

	const podiumPlayers = $derived([
		{ player: second, place: 2, heightClass: 'h-28 sm:h-32', label: '2nd' },
		{ player: first, place: 1, heightClass: 'h-36 sm:h-44', label: '1st' },
		{ player: third, place: 3, heightClass: 'h-24 sm:h-28', label: '3rd' },
	]);

	const remainingPlayers = $derived(rankedPlayers.slice(3));
</script>

<div class="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6">
	<div
		class="rounded-xl border-2 border-black/20 bg-white/90 p-5 text-center shadow-lg backdrop-blur-sm"
	>
		<p class="text-sm font-bold uppercase tracking-widest text-red-primary">Game Results</p>

		{#if first}
			<h1 class="mt-1 text-3xl font-black text-blue-primary sm:text-5xl">
				{first.display_name} wins!
			</h1>
			<p class="mt-2 text-sm font-semibold text-black/60">Final rankings from best to worst</p>
		{:else}
			<h1 class="mt-1 text-3xl font-black text-blue-primary sm:text-5xl">Results</h1>
		{/if}
	</div>

	<div
		class="rounded-xl border-2 border-black/20 bg-white/85 p-4 shadow-lg backdrop-blur-sm sm:p-6"
	>
		<div class="flex items-end justify-center gap-2 sm:gap-5">
			{#each podiumPlayers as { player, place, heightClass, label } (place)}
				<div class="flex min-w-0 flex-1 flex-col items-center">
					{#if player}
						<div
							class={[
								'relative mb-2 flex size-16 items-center justify-center rounded-full border-4 bg-white shadow-md sm:size-20',
								place === 1
									? 'border-yellow-dark'
									: place === 2
										? 'border-grey'
										: 'border-red-primary',
							]}
						>
							{#if player.url}
								<img
									src={player.url}
									alt={player.display_name}
									class="size-full rounded-full object-cover p-1"
								/>
							{:else}
								<span class="text-2xl font-black text-blue-primary">
									{player.display_name.slice(0, 1).toUpperCase()}
								</span>
							{/if}

							<div
								class="absolute -top-3 rounded-full bg-blue-primary px-2 py-0.5 text-xs font-black text-white shadow"
							>
								#{place}
							</div>
						</div>

						<p
							class="max-w-full truncate text-center text-sm font-black text-blue-primary sm:text-base"
						>
							{player.display_name}
						</p>
						<p class="mb-2 text-xs font-bold text-black/60">
							{player.score} correct
						</p>
					{:else}
						<div
							class="mb-2 size-16 rounded-full border-4 border-dashed border-black/10 sm:size-20"
						></div>
						<p class="mb-7 text-sm font-bold text-black/30">Empty</p>
					{/if}

					<div
						class={[
							'flex w-full items-center justify-center rounded-t-lg border-2 border-b-0 border-black/20 px-2 shadow-inner',
							heightClass,
							place === 1
								? 'bg-yellow-dark text-white'
								: place === 2
									? 'bg-blue-primary text-white'
									: 'bg-red-primary text-white',
						]}
					>
						<span class="text-2xl font-black sm:text-4xl">{label}</span>
					</div>
				</div>
			{/each}
		</div>

		<div class="h-4 rounded-b-lg border-2 border-black/20 bg-black/10"></div>
	</div>

	{#if remainingPlayers.length > 0}
		<div
			class="rounded-xl border-2 border-black/20 bg-white/90 p-4 shadow-lg backdrop-blur-sm sm:p-5"
		>
			<h2 class="mb-3 text-xl font-black text-blue-primary">Remaining Players</h2>

			<div class="flex flex-col gap-2">
				{#each remainingPlayers as player, i (player.id)}
					<div
						class="flex items-center gap-3 rounded-lg border-2 border-black/10 bg-white px-3 py-2 shadow-sm"
					>
						<div class="w-8 text-center text-lg font-black text-red-primary">
							#{i + 4}
						</div>

						{#if player.url}
							<img
								src={player.url}
								alt={player.display_name}
								class="size-10 rounded-full border-2 border-black/10 bg-white object-cover p-0.5"
							/>
						{:else}
							<div
								class="flex size-10 items-center justify-center rounded-full border-2 border-black/10 bg-blue-primary text-lg font-black text-white"
							>
								{player.display_name.slice(0, 1).toUpperCase()}
							</div>
						{/if}

						<div class="min-w-0 flex-1">
							<p class="truncate font-black text-blue-primary">{player.display_name}</p>
							<p class="text-xs font-semibold text-black/50">
								{player.totalGuesses} guesses
							</p>
						</div>

						<div class="rounded-md bg-black/5 px-3 py-1 text-sm font-black text-black/70">
							{player.score} correct
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if room.currentPlayer.is_host}
		<div class="flex justify-center">
			<Button type="button">Back to Lobby</Button>
		</div>
	{/if}
</div> -->
