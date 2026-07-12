<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Slider from '$lib/components/Slider.svelte';
	import { getOnlineRoom } from '../_lib/online-room-context';
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

	// const startDisabled = room.players.length === 1 || room.leaving;
</script>

<div class="flex flex-col items-center gap-y-8 w-full px-4">
	<div class="max-w-md w-full bg-white rounded-md p-5 shadow-sm space-y-4">
		<div class="bg-blue-primary rounded-md text-center p-3 text-white border-2 border-black/20">
			<p class="text-sm font-black tracking-widest">ROOM CODE</p>
			<p class="text-4xl font-black tracking-widest">{room.game.room_code}</p>
		</div>
		<div class="space-y-4">
			{#if room.currentPlayer.is_host}
				<div class="space-y-14">
					<div class="space-y-12">
						<Slider slides={NUMBER_OF_ROUNDS_OPTIONS} bind:slide={numberOfRounds} label="Rounds" />
						<Slider
							slides={GUESS_TIME_OPTIONS}
							bind:slide={guessTime}
							label="Guess time (seconds)"
						/>
					</div>
					<Button type="button" onclick={start} submitting={starting}>Start</Button>
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
				<div class="flex bg-green-light rounded-md overflow-hidden items-center max-w-xs">
					<img alt="Player icon" src={player.url} class="w-28 p-2 bg-green-primary" />
					<p class="p-4 text-white font-bold text-3xl">
						{#if player.is_host}👑{/if}
						{player.display_name}
					</p>
				</div>
			{/each}
		</div>
	</div>
</div>
