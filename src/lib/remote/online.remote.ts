import { invalid } from '@sveltejs/kit';
import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { GUESS_TIME_OPTIONS, NUMBER_OF_ROUNDS_OPTIONS } from '$lib/utils/constants';

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
			invalid('Failed to start game');
		}

		const { error: roundError } = await supabase.rpc('create_online_rounds', {
			p_game_id: gameId,
			p_number_of_rounds: numberOfRounds,
		});

		if (roundError) {
			console.error(roundError.message);
			invalid('Failed to create rounds');
		}

		const { error: gameError } = await supabase
			.from('online_games')
			.update({
				guess_time: guessTime,
				number_of_rounds: numberOfRounds,
				status: 'ingame',
			})
			.eq('id', gameId);

		if (gameError) {
			console.error(gameError.message);
			invalid('Failed to start game');
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
			invalid('Failed to leave game');
		}

		const { count, error: playersError } = await supabase
			.from('online_players')
			.select()
			.eq('game_id', gameId);

		if (playersError) {
			console.error(playersError.message);
			invalid('Failed to leave game');
		}

		if (count === 1) {
			const { error } = await supabase.from('online_games').delete().eq('id', gameId);
			if (error) {
				console.error(error.message);
				invalid('Failed to leave game');
			}
		} else {
			const { error } = await supabase
				.from('online_players')
				.delete()
				.eq('user_id', user.id)
				.eq('game_id', gameId);
			if (error) {
				console.error(error.message);
				invalid('Failed to leave game');
			}
		}
	},
);
