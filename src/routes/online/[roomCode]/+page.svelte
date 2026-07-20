<script lang="ts">
	import { untrack } from 'svelte';
	import Lobby from './_components/Lobby/index.svelte';
	import InGame from './_components/InGame/index.svelte';
	import Results from './_components/Results.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { setOnlineRoom } from '$lib/context/online-room/online-room-context';
	import { OnlineRoomState } from '$lib/context/online-room/online-room-state.svelte';
	import { getSounds } from '$lib/context/sounds/sounds-context';
	import { getSettings } from '$lib/context/settings/settings-context';
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

	const settings = getSettings();
	const sounds = getSounds();

	const View = $derived(VIEWS[room.game.status]);

	$effect(() => {
		let channel: ReturnType<typeof supabase.channel> | undefined;
		let cancelled = false;

		const setupChannel = async () => {
			if (!data.realtimeAccessToken || cancelled) return;

			await supabase.realtime.setAuth(data.realtimeAccessToken);

			channel = supabase.channel(`online-room:${room.game.room_code}`, {
				config: {
					presence: {
						key: String(room.currentPlayer.id),
					},
				},
			});

			channel
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
				.on('presence', { event: 'sync' }, () => {
					const presenceState = channel?.presenceState<{
						playerId: number;
						displayName: string;
					}>();

					if (presenceState) {
						const onlinePlayerIds = Object.values(presenceState)
							.flat()
							.map(presence => presence.playerId);

						room.setOnlinePlayerIds([...new Set(onlinePlayerIds)], room.currentPlayer.id);
					}
				})
				.subscribe(async status => {
					if (status !== 'SUBSCRIBED') return;

					await channel?.track({
						playerId: room.currentPlayer.id,
						displayName: room.currentPlayer.display_name,
					});
				});
		};

		void setupChannel();

		return () => {
			cancelled = true;

			if (channel) {
				void channel.untrack();
				void supabase.removeChannel(channel);
			}
		};
	});

	const HOST_TRANSFER_DELAY_MS = 5000;

	$effect(() => {
		if (!room.presenceReady) return;
		if (room.currentPlayer.is_host) return;

		const host = room.players.find(player => player.is_host);

		if (!host) return;
		if (room.isPlayerOnline(host.id)) return;

		const oldestOnlinePlayer = room.players
			.filter(player => player.id !== host.id)
			.filter(player => room.isPlayerOnline(player.id))
			.toSorted((a, b) => {
				const createdAtDiff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

				if (createdAtDiff !== 0) return createdAtDiff;

				return a.id - b.id;
			})[0];

		if (oldestOnlinePlayer?.id !== room.currentPlayer.id) return;

		const timeout = window.setTimeout(() => {
			const currentHost = room.players.find(player => player.is_host);

			if (!currentHost) return;
			if (currentHost.id !== host.id) return;
			if (room.isPlayerOnline(currentHost.id)) return;

			const currentOldestOnlinePlayer = room.players
				.filter(player => player.id !== currentHost.id)
				.filter(player => room.isPlayerOnline(player.id))
				.toSorted((a, b) => {
					const createdAtDiff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

					if (createdAtDiff !== 0) return createdAtDiff;

					return a.id - b.id;
				})[0];

			if (currentOldestOnlinePlayer?.id !== room.currentPlayer.id) return;

			void room.claimHost(currentHost.id);
		}, HOST_TRANSFER_DELAY_MS);

		return () => {
			window.clearTimeout(timeout);
		};
	});

	$effect(() => {
		if (settings.musicVolume <= 0) return;
		sounds.play('binksSake');

		return () => {
			sounds.stop('binksSake');
		};
	});
</script>

<svelte:head>
	<title>Grandlinedle - {room.game.room_code}</title>
	<meta name="description" content="Play online against other players!" />
</svelte:head>

<View />
