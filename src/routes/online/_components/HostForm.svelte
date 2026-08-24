<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';

	type HostFailure = {
		errors: {
			displayName?: string[];
			generic?: string[];
		};
	};

	let submitting = $state(false);
	let displayNameError = $state<string>();
	let genericError = $state<string>();
</script>

<form
	class="space-y-4 max-w-96 w-full"
	method="POST"
	action="/online?/host"
	use:enhance={() => {
		displayNameError = '';
		genericError = ""
		submitting = true;

		return async ({ update, result }) => {
			await update();
			submitting = false;

			if (result.type === 'failure') {
				const data = result.data as HostFailure;
				displayNameError = data.errors?.displayName?.[0];
				genericError = data.errors?.generic?.[0]
			}
		};
	}}
>
	<h1 class="p-2 text-4xl font-bold text-center text-white text-shadow-sm text-shadow-black">
		Host Game
	</h1>
	<p class="text-base text-red-primary text-center">
		{genericError}
	</p>
	<Input name="displayName" label="Display name" error={displayNameError} required />
	<Button type="submit" {submitting}>Host</Button>
</form>
