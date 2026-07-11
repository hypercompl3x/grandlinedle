<script lang="ts">
	import { untrack } from 'svelte';
	import Lobby from './_components/Lobby.svelte';
	import InGame from './_components/InGame.svelte';
	import Results from './_components/Results.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { setOnlineRoom } from './_lib/online-room-context';
	import { OnlineRoomState } from './_lib/online-room-state.svelte';
	import { GAME_STATUSES } from '$lib/utils/constants';
	import type {
		OnlineGame,
		OnlineGuess,
		OnlinePlayer,
		OnlineRound,
	} from '$lib/types/DatabaseTypes';

	let { data } = $props();

	const VIEWS = {
		[GAME_STATUSES.LOBBY]: Lobby,
		[GAME_STATUSES.IN_GAME]: InGame,
		[GAME_STATUSES.RESULTS]: Results,
	} as const;

	const room = setOnlineRoom(
		untrack(
			() =>
				new OnlineRoomState({
					supabase,
					game: data.game,
					players: data.players,
					rounds: data.rounds,
					guesses: data.guesses,
					currentPlayer: data.currentPlayer,
					userId: data.userId,
				}),
		),
	);

	const View = $derived(VIEWS[room.game.status]);

	$effect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_OUT') {
				void room.kickToOnline();
				return;
			}

			if (session?.user && session.user.id !== room.userId) {
				void room.kickToOnline();
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	});

	$effect(() => {
		const channel = supabase
			.channel(`online-room:${data.game.room_code}`)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'online_games',
					filter: `room_code=eq.${data.game.room_code}`,
				},
				payload => {
					room.updateGame(payload.new as OnlineGame);
				},
			)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'online_players',
					filter: `game_id=eq.${data.game.id}`,
				},
				payload => {
					void room.addPlayer(payload.new as OnlinePlayer);
				},
			)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'online_players',
					filter: `game_id=eq.${data.game.id}`,
				},
				payload => {
					room.updatePlayer(payload.new as OnlinePlayer);
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
					room.deletePlayer(payload.old.id as OnlinePlayer['id']);
				},
			)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'online_rounds',
					filter: `game_id=eq.${data.game.id}`,
				},
				payload => {
					void room.addRound(payload.new as OnlineRound);
				},
			)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'online_rounds',
					filter: `game_id=eq.${data.game.id}`,
				},
				payload => {
					room.updateRound(payload.new as OnlineRound);
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
					room.deleteRound(payload.old.id as OnlineRound['id']);
				},
			)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'online_guesses',
					filter: `game_id=eq.${data.game.id}`,
				},
				payload => {
					void room.addGuess(payload.new as OnlineGuess);
				},
			)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'online_guesses',
					filter: `game_id=eq.${data.game.id}`,
				},
				payload => {
					room.updateGuess(payload.new as OnlineGuess);
				},
			)
			.on(
				'postgres_changes',
				{
					event: 'DELETE',
					schema: 'public',
					table: 'online_guesses',
				},
				payload => {
					room.deleteGuess(payload.old.id as OnlineGuess['id']);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	});
</script>

<svelte:head>
	<title>Grandlinedle - Online</title>
	<meta name="description" content="Play online against other players!" />
</svelte:head>

<View />
