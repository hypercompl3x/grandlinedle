import { invalid } from '@sveltejs/kit';
import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import {
	GUESS_TIME_OPTIONS,
	MAX_GUESSES,
	NUMBER_OF_ROUNDS_OPTIONS,
	TIMER,
} from '$lib/utils/constants';

export const startGame = command(
	v.object({
		guessTime: v.pipe(
			v.number(),
			v.integer(),
			v.minValue(GUESS_TIME_OPTIONS[0], 'The minimum number is 5'),
			v.maxValue(GUESS_TIME_OPTIONS.at(-1)!, 'The maximum number is 30'),
		),
		numberOfRounds: v.pipe(
			v.number(),
			v.integer(),
			v.minValue(NUMBER_OF_ROUNDS_OPTIONS[0], 'The minimum number is 1'),
			v.maxValue(NUMBER_OF_ROUNDS_OPTIONS.at(-1)!, 'The maximum number is 8'),
		),
		gameId: v.pipe(v.number(), v.integer()),
	}),
	async ({ guessTime, numberOfRounds, gameId }) => {
		const {
			locals: { session, user, supabase },
		} = getRequestEvent();

		if (!session || !user) {
			invalid('Not authenticated');
		}

		const { error: startGameError } = await supabase.rpc('start_online_game', {
			p_game_id: gameId,
			p_number_of_rounds: numberOfRounds,
			p_guess_time: guessTime,
		});

		if (startGameError) {
			console.error(startGameError.message);
			invalid('Failed to start game');
		}
	},
);

export const resetGameToLobby = command(
	v.object({
		gameId: v.pipe(v.number(), v.integer()),
	}),
	async ({ gameId }) => {
		const {
			locals: { session, user, supabase },
		} = getRequestEvent();

		if (!session || !user) {
			invalid('Not authenticated');
		}

		const { error } = await supabase.rpc('reset_online_game_to_lobby', {
			p_game_id: gameId,
		});

		if (error) {
			console.error(error.message);
			invalid('Failed to go back to lobby');
		}
	},
);

export const advanceGameIfReady = command(
	v.object({
		gameId: v.pipe(v.number(), v.integer()),
	}),
	async ({ gameId }) => {
		const {
			locals: { session, user, supabase },
		} = getRequestEvent();

		if (!session || !user) {
			throw new Error('Not authenticated');
		}

		const { error } = await supabase.rpc('advance_online_game_if_ready', {
			p_game_id: gameId,
			p_max_guess_number: MAX_GUESSES,
			p_reveal_seconds: TIMER.REVEAL,
			p_results_seconds: TIMER.RESULTS,
		});

		if (error) {
			console.error('Failed to advance game:', error.message);
			throw new Error(error.message);
		}

		return { success: true };
	},
);

export const advanceGameFromResults = command(
	v.object({
		gameId: v.pipe(v.number(), v.integer()),
	}),
	async ({ gameId }) => {
		const {
			locals: { session, user, supabase },
		} = getRequestEvent();

		if (!session || !user) {
			throw new Error('Not authenticated');
		}

		const { error } = await supabase.rpc('advance_online_game_from_results', {
			p_game_id: gameId,
			p_max_guess_number: MAX_GUESSES,
		});

		if (error) {
			console.error('Failed to advance from results:', error.message);
			throw new Error(error.message);
		}
	},
);

export const leaveGame = command(
	v.object({
		gameId: v.pipe(v.number(), v.integer()),
	}),
	async ({ gameId }) => {
		const {
			locals: { session, user, supabase },
		} = getRequestEvent();

		if (!session || !user) {
			throw new Error('Not authenticated');
		}

		const { error } = await supabase.rpc('leave_online_game', {
			p_game_id: gameId,
		});

		if (error) {
			throw new Error(error.message);
		}
	},
);
