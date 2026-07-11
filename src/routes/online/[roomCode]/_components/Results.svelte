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

{#if room.currentPlayer.is_host}
	<Button type="button" onclick={resetGame} submitting={resetting}>Back to lobby</Button>
{/if}
