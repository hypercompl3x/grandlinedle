<script lang="ts">
	import { getOnlineRoom } from '../_lib/online-room-context';

	const room = getOnlineRoom();
</script>

<div>
	{room.game.current_round_number}
</div>
