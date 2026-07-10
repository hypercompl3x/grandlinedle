<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import type { OnlineGame, OnlinePlayer } from '$lib/types/DatabaseTypes';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const { players: initialPlayers, ...initialGame } = data.game;

	let game = $state(initialGame);
	let players = $state(initialPlayers);

	$effect(() => {
		console.log('TEST RUN');

		const channel = supabase
			.channel(`online-room:${initialGame.room_code}`)
			.on(
				'postgres_changes',
				{
					event: '*',
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
					event: '*',
					schema: 'public',
					table: 'online_players',
					filter: `game_id=eq.${initialGame.id}`,
				},
				payload => {
					if (payload.eventType === 'DELETE') {
						players = players.filter(p => p.id !== payload.old.id);
						return;
					}

					const newPlayer = payload.new as OnlinePlayer;

					if (payload.eventType === 'INSERT') {
						players = [...players, newPlayer];
						return;
					}

					players = players.map(p => {
						if (p.id !== payload.new.id) return p;
						return newPlayer;
					});
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	});
</script>

{#if game.status === 'lobby'}
	{game.room_code}
	{game.number_of_rounds}
	{#each players as player (`player-${player.id}`)}
		{player.display_name}
	{/each}
{/if}
