<script lang="ts">
	import { goto } from '$app/navigation';
	import Slider from '$lib/components/Slider.svelte';
	import Button from '$lib/components/Button.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { leaveGame, startGame } from '$lib/remote/online.remote';
	import {
		GENERIC_ERROR,
		GUESS_TIME_OPTIONS,
		NUMBER_OF_ROUNDS_OPTIONS,
	} from '$lib/utils/constants';
	import type { OnlineGame, OnlinePlayer, OnlineRound } from '$lib/types/DatabaseTypes';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const {
		players: initialPlayers,
		game: initialGame,
		rounds: initialRounds,
		currentPlayer: initialCurrentPlayer,
		userId,
	} = data;

	let game = $state(initialGame);
	let players = $state(initialPlayers);
	let rounds = $state(initialRounds);
	let currentPlayer = $state(initialCurrentPlayer);

	let numberOfRounds = $state(initialGame.number_of_rounds);
	let guessTime = $state(initialGame.guess_time);

	let starting = $state(false);
	let startingError = $state('');
	let leaving = $state(false);
	let leavingError = $state('');

	const handleLeaveGame = async () => {
		leaving = true;
		leavingError = '';

		try {
			await leaveGame({
				gameId: game.id,
			});
			await goto('/online', { replaceState: true });
		} catch (e) {
			leavingError = GENERIC_ERROR;
		} finally {
			leaving = false;
		}
	};

	const handleStartGame = async () => {
		starting = true;
		startingError = '';

		try {
			await startGame({
				gameId: game.id,
				guessTime,
				numberOfRounds,
			});
		} catch (_) {
			startingError = GENERIC_ERROR;
		} finally {
			starting = false;
		}
	};

	$effect(() => {
		const channel = supabase
			.channel(`online-room:${initialGame.room_code}`)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'online_games',
					filter: `room_code=eq.${initialGame.room_code}`,
				},
				payload => {
					game = payload.new as OnlineGame;
				},
			)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'online_players',
					filter: `game_id=eq.${initialGame.id}`,
				},
				payload => {
					const newPlayer = payload.new as OnlinePlayer;
					const playerAlreadyInPlayers = players.some(player => player.id === newPlayer.id);
					if (playerAlreadyInPlayers) return;
					players = [...players, newPlayer].toSorted((a, b) => a.id - b.id);
				},
			)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'online_players',
					filter: `game_id=eq.${initialGame.id}`,
				},
				payload => {
					const newPlayer = payload.new as OnlinePlayer;

					players = players.map(p => {
						if (p.id !== payload.new.id) return p;
						return newPlayer;
					});

					if (currentPlayer.id === newPlayer.id) {
						currentPlayer = newPlayer;
					}
				},
			)
			.on(
				'postgres_changes',
				{
					event: 'DELETE',
					schema: 'public',
					table: 'online_players',
				},
				async payload => {
					const deletedPlayer = payload.old as Pick<OnlinePlayer, 'id'>;
					players = players.filter(p => p.id !== deletedPlayer.id);

					if (currentPlayer.id === deletedPlayer.id) {
						await supabase.auth.signOut();
						await goto('/online', { replaceState: true });
					}
				},
			)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'online_rounds',
					filter: `game_id=eq.${initialGame.id}`,
				},
				payload => {
					rounds = [...rounds, payload.new as OnlineRound].toSorted(
						(a, b) => a.round_number - b.round_number,
					);
				},
			)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'online_rounds',
					filter: `game_id=eq.${initialGame.id}`,
				},
				payload => {
					rounds = rounds.map(r => {
						if (r.id !== payload.new.id) return r;
						return payload.new as OnlineRound;
					});
				},
			)
			.on(
				'postgres_changes',
				{
					event: 'DELETE',
					schema: 'public',
					table: 'online_rounds',
				},
				payload => {
					const deletedRound = payload.old as Pick<OnlineRound, 'id'>;
					rounds = rounds.filter(r => r.id !== deletedRound.id);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	});
</script>

{#if game.status === 'lobby'}
	<div class="space-y-8 w-full">
		<p>
			{game.room_code}
		</p>
		<p>{game.number_of_rounds}</p>
		<p class="text-base text-red-primary text-center">{startingError || leavingError}</p>
		{#if currentPlayer.is_host}
			<div class="space-y-8">
				<Slider slides={NUMBER_OF_ROUNDS_OPTIONS} bind:slide={numberOfRounds} label="Rounds" />
				<Slider slides={GUESS_TIME_OPTIONS} bind:slide={guessTime} label="Guess time" />
				<Button
					type="button"
					onclick={handleStartGame}
					disabled={players.length === 1 || leaving}
					submitting={starting}
				>
					Start
				</Button>
			</div>
		{/if}
		<Button type="button" onclick={handleLeaveGame} submitting={leaving} disabled={starting}>
			Leave
		</Button>
		{#each players as player (`player-${player.id}`)}
			<p>{player.display_name}</p>
		{/each}
	</div>
{/if}

{#if game.status === 'ingame'}
	<div>
		{#each rounds as round (`round-${round.id}`)}
			<p>{round.round_number}</p>
		{/each}
	</div>
{/if}

{#if game.status === 'finished'}
	FINISHED
{/if}
