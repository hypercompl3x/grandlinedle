<script lang="ts">
	import { X } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import Slider from '$lib/components/Slider.svelte';
	import HowToPlay from './HowToPlay.svelte';
	import { getOnlineRoom } from '$lib/context/online-room/online-room-context';
	import { startGame } from '$lib/remote/online.remote';
	import {
		GUESS_TIME_OPTIONS,
		MAX_ONLINE_PLAYER_COUNT,
		NUMBER_OF_ROUNDS_OPTIONS,
	} from '$lib/utils/constants';

	const room = getOnlineRoom();

	let numberOfRounds = $derived(room.game.number_of_rounds);
	let guessTime = $derived(room.game.guess_time);

	let starting = $state(false);
	let showCopiedMessage = $state(false);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(room.game.room_code);
		showCopiedMessage = true;
		setTimeout(() => (showCopiedMessage = false), 1500);
	};

	const start = async () => {
		starting = true;

		try {
			await startGame({
				gameId: room.game.id,
				guessTime,
				numberOfRounds,
			});
		} finally {
			starting = false;
		}
	};
</script>

<div class="flex flex-col items-center gap-y-8 w-full px-4 pb-12">
	<HowToPlay />
	<div class="max-w-md w-full bg-white rounded-md p-5 shadow-sm space-y-4">
		<button
			type="button"
			onclick={copyToClipboard}
			class="bg-blue-primary rounded-md text-center p-3 text-white border-2 border-black/20 w-full relative hover:brightness-105"
		>
			{#if showCopiedMessage}
				<p
					class="text-base font-bold text-blue-primary text-center absolute inset-x-0 mx-auto -bottom-7"
				>
					Copied successfully!
				</p>{/if}
			<p class="text-sm font-black tracking-widest">ROOM CODE</p>
			<p class="text-4xl font-black tracking-widest">{room.game.room_code}</p>
		</button>
		<div class="space-y-4">
			{#if room.currentPlayer.is_host}
				<div class="space-y-14">
					<div class="space-y-12">
						<Slider
							slides={NUMBER_OF_ROUNDS_OPTIONS}
							bind:slide={numberOfRounds}
							label="Rounds"
							showSlides
						/>
						<Slider
							slides={GUESS_TIME_OPTIONS}
							bind:slide={guessTime}
							label="Guess time (seconds)"
							showSlides
						/>
					</div>
					<Button
						type="button"
						onclick={start}
						disabled={room.players.length === 1 || room.leaving}
						submitting={starting}
					>
						Start
					</Button>
				</div>
			{/if}
			<Button
				type="button"
				onclick={() => room.leave()}
				submitting={room.leaving}
				disabled={starting}
				class="from-red-primary to-red-medium-dark"
			>
				Leave
			</Button>
		</div>
	</div>
	<div class="space-y-2">
		<p class="p-2 text-4xl font-bold text-center text-white text-shadow-sm text-shadow-black">
			Crew Members ({room.players.length}/{MAX_ONLINE_PLAYER_COUNT})
		</p>
		<div class="flex flex-wrap gap-8 justify-center">
			{#each room.players as player (`player-${player.id}`)}
				{const isOnline = $derived(room.isPlayerOnline(player.id))}
				<div class="relative flex max-sm:flex-col sm:items-stretch">
					<img
						alt={player.display_name}
						src={player.url}
						class="sm:w-28 max-sm:rounded-t-md sm:rounded-l-md bg-green-primary p-2"
					/>
					<p
						class="flex items-center max-sm:rounded-b-md sm:rounded-r-md bg-green-light p-4 text-3xl font-bold text-white max-sm:justify-center"
					>
						<span class:animate-pulse={!isOnline}>
							{#if player.is_host}👑{/if}
							{player.display_name}
						</span>
					</p>
					{#if room.currentPlayer.is_host && player.id !== room.currentPlayer.id}
						<button
							type="button"
							onclick={() => room.kickPlayer(player.id)}
							disabled={room.kickingPlayerId === player.id}
							class="group/kick absolute -right-2 -top-2 rounded-full bg-white p-0.5"
						>
							<X class="size-5 stroke-3 group-hover/kick:text-red-primary" />
						</button>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
