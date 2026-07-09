<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import useOnClickOutside from '$lib/hooks/useOnClickOutside.svelte';
	import { cn } from '$lib/utils/helpers';

	type HostFailure = {
		errors: {
			displayName?: string[];
			numberOfRounds?: string[];
			generic?: string[];
		};
	};

	let isDropdownOpen = $state(false);
	let submitting = $state(false);
	let numberOfRounds = $state(1);
	let displayNameError = $state<string>();
	let numberOfRoundsError = $state<string>();
	let genericError = $state<string>();

	const onClickOutside = useOnClickOutside(() => (isDropdownOpen = false));

	const ROUND_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
</script>

<form
	class="space-y-4 max-w-96 w-full"
	method="POST"
	action="/online?/host"
	use:enhance={() => {
		displayNameError = '';
		numberOfRoundsError = '';
		genericError = ""
		submitting = true;

		return async ({ update, result }) => {
			await update();
			submitting = false;

			if (result.type === 'failure') {
				const data = result.data as HostFailure;
				displayNameError = data.errors?.displayName?.[0];
				numberOfRoundsError = data.errors?.numberOfRounds?.[0];
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
	<div class="flex flex-col space-y-1 w-full">
		<label for="numberOfRounds" class="text-lg font-medium text-left">
			Number of rounds
			<span class="text-red-primary">*</span>
			<div bind:this={onClickOutside.containerEl} class="relative w-full">
				<input type="number" class="hidden" name="numberOfRounds" value={numberOfRounds} />
				<button
					id="numberOfRounds"
					onclick={() => (isDropdownOpen = true)}
					type="button"
					class={cn(
						'flex items-center w-full h-10 px-3 py-2 border border-black rounded-md focus-visible:outline-hidden bg-white mt-0.5',
						{ 'border-red-primary': !!numberOfRoundsError },
					)}
				>
					{numberOfRounds}
				</button>
				{#if isDropdownOpen}
					<div
						class="absolute top-10.5 bg-white inset-x-0 mx-auto rounded-md overflow-hidden max-h-80 overflow-y-auto z-20"
					>
						{#each ROUND_OPTIONS as round (`${round}-dropdown-item`)}
							<button
								type="button"
								onclick={() => {
									numberOfRounds = round;
									isDropdownOpen = false;
								}}
								class="flex items-center w-full px-4 py-2 text-xl font-bold text-left hover:bg-blue-primary hover:text-white gap-x-5 focus-visible:outline-hidden focus:bg-blue-primary focus:text-white"
							>
								{round}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</label>
		<p class="text-sm text-left text-red-primary h-5">
			{numberOfRoundsError}
		</p>
	</div>

	<Button type="submit" {submitting}>Host</Button>
</form>
