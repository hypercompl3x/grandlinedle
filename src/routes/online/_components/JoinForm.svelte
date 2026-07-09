<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';

	type JoinFailure = {
		errors: {
			displayName?: string[];
			roomCode?: string[];
			generic?: string[];
		};
	};

	let submitting = $state(false);
	let displayNameError = $state<string>();
	let roomCodeError = $state<string>();
	let genericError = $state<string>();
</script>

<form
	class="space-y-2 max-w-96 w-full"
	method="POST"
	action="/online?/join"
	use:enhance={() => {
		displayNameError = '';
		roomCodeError = '';
		genericError = ""
		submitting = true;

		return async ({ update, result }) => {
			await update();
			submitting = false;

			if (result.type === 'failure') {
				const data = result.data as JoinFailure;
				displayNameError = data.errors?.displayName?.[0];
				roomCodeError = data.errors?.roomCode?.[0];
				genericError = data.errors?.generic?.[0]
			}
		};
	}}
>
	<h1 class="p-2 text-4xl font-bold text-center text-white text-shadow-sm text-shadow-black">
		Join Game
	</h1>
	<p class="text-base text-red-primary text-center">
		{genericError}
	</p>
	<div class="space-y-2">
		<Input name="displayName" label="Display name" error={displayNameError} required />
		<Input name="roomCode" label="Room code" error={roomCodeError} required />
	</div>
	<Button type="submit" {submitting}>Join</Button>
</form>
