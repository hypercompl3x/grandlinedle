<script lang="ts">
	import { page } from '$app/state';
	import { supabase } from '$lib/supabaseClient';
	// CHECK FOR AUTH
	// CHECK YOUR IN THIS GAME

	$effect(() => {
		const channel = supabase
			.channel('custom-filter-channel')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'online_games',
					filter: `room_code=eq.${page.params.roomCode}`,
				},
				payload => {
					console.log('Change received!', payload);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	});
</script>
