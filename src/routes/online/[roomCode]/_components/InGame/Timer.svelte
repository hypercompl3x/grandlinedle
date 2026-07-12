<script lang="ts">
	import { browser } from '$app/environment';
	import { getOnlineRoom } from '../../_lib/online-room-context';
	import { MAX_GUESSES, TIMER } from '$lib/utils/constants';

	const room = getOnlineRoom();

	const TIMER_BUFFER_MS = 300;

	let now = $state(Date.now());

	$effect(() => {
		if (!browser) return;

		const interval = window.setInterval(() => {
			now = Date.now();
		}, 250);

		return () => window.clearInterval(interval);
	});

	const timerDurationSeconds = $derived.by(() => {
		const game = room.game;
		const round = room.currentRound;

		if (game.status !== 'in_game' || !round || !game.sub_status_started_at) {
			return null;
		}

		if (game.sub_status === 'guessing') {
			return game.guess_time;
		}

		if (game.sub_status === 'revealing') {
			return TIMER.REVEAL;
		}

		if (game.sub_status === 'results') {
			const someoneCorrect = room.guesses.some(
				guess =>
					guess.round_id === round.id &&
					guess.guess_number === round.current_guess_number &&
					guess.character_id === round.character_id,
			);

			const anotherClueAvailable = round.current_guess_number < MAX_GUESSES;

			if (someoneCorrect || !anotherClueAvailable) {
				return null;
			}

			return TIMER.RESULTS;
		}

		return null;
	});

	const timeRemaining = $derived.by(() => {
		const startedAt = room.game.sub_status_started_at;

		if (!startedAt || timerDurationSeconds === null) {
			return null;
		}

		const startedAtMs = new Date(startedAt).getTime();
		const endAtMs = startedAtMs + timerDurationSeconds * 1000;
		const remaining = Math.ceil((endAtMs - now) / 1000);

		return Math.min(timerDurationSeconds, Math.max(0, remaining));
	});

	$effect(() => {
		if (!browser) return;

		const startedAt = room.game.sub_status_started_at;

		if (!startedAt || timerDurationSeconds === null) return;

		const startedAtMs = new Date(startedAt).getTime();
		const endAtMs = startedAtMs + timerDurationSeconds * 1000;
		const delayMs = Math.max(0, endAtMs - Date.now() + TIMER_BUFFER_MS);

		const timeout = window.setTimeout(() => {
			void room.advanceGameIfReady();
		}, delayMs);

		return () => window.clearTimeout(timeout);
	});
</script>

{#if timeRemaining !== null}
	<p class="p-2 text-6xl font-bold text-center text-white text-shadow-sm text-shadow-black">
		{timeRemaining}
	</p>
{/if}
