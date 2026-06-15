<script lang="ts">
	import { Loader2, X } from 'lucide-svelte';
	import type { LayoutData } from '../../routes/$types';
	import { enhance } from '$app/forms';
	import { cn } from '$lib/utils/helpers';

	type Props = {
		dialog: HTMLDialogElement | undefined;
		data: LayoutData;
	};

	let { dialog = $bindable(), data }: Props = $props();

	const initialPlayerName = () => data.playerName;
	let playerName = $state(initialPlayerName());
	let submissionError = $state('');
	let submitting = $state(false);
	let submitSuccessful = $state(false);

	let showCopiedMessage = $state(false);
	const copyText = $derived(
		() => `I've completed all the modes of Grandlinedle #${data.todayNumber} today:
❓ Classic: ${data.characterGuessesLen}
🌍  ${data.locationHardMode ? 'Hard' : 'Easy'} Location: ${data.locationGuessesLen}
💬 Quote: ${data.quoteCharacterGuessesLen}
🏴‍☠️ Crew: ${data.crewGuessesLen}
https://grandlinedle.com`,
	);

	$effect(() => {
		if (!dialog) return;

		if (data.completed) {
			if (!dialog.open) dialog.showModal();
		} else {
			if (dialog.open) dialog.close();
		}
	});

	const copyToClipboard = () => {
		navigator.clipboard.writeText(copyText());
		showCopiedMessage = true;
		setTimeout(() => (showCopiedMessage = false), 1500);
	};
</script>

<dialog
	bind:this={dialog}
	class="w-[calc(100%-32px)] sm:w-full overflow-hidden rounded-md max-w-96 backdrop:bg-black backdrop:bg-opacity-40"
	onclick={e => {
		if (e.target === dialog && !submitting) {
			dialog.close();
		}
	}}
>
	<div class="relative flex justify-center p-2 text-white bg-red-primary">
		<div class="text-xl font-semibold sm:text-3xl">Congratulations!</div>
		<button
			type="button"
			disabled={submitting}
			onclick={() => dialog?.close()}
			class="absolute inset-y-0 focus:ring-0 focus:outline-none right-2"
			><X class="stroke-2 sm:stroke-[3px] size-6 sm:size-8" /></button
		>
	</div>
	<div class="flex flex-col items-center text-lg text-center">
		<div class="w-4/5 px-2 pt-2 pb-4 space-y-2">
			<div>I've completed all the modes of <b>Grandlinedle</b> #{data.todayNumber} today:</div>
			<div>
				<div>❓ Classic: {data.characterGuessesLen}</div>
				<div>
					🌍 {data.locationHardMode ? 'Hard' : 'Easy'} Location: {data.locationGuessesLen}
				</div>
				<div>💬 Quote: {data.quoteCharacterGuessesLen}</div>
				<div>🏴‍☠️ Crew: {data.crewGuessesLen}</div>
			</div>
			<div>https://grandlinedle.com</div>
			<div>
				{#if showCopiedMessage}
					<div class="text-base font-bold">Copied successfully!</div>{/if}
				<button
					type="button"
					class="py-1.5 px-3 font-bold text-lg rounded-md bg-blue-dark text-white"
					onclick={copyToClipboard}>COPY</button
				>
			</div>
		</div>

		{#if !data.submittedEntry && !submitSuccessful}
			<div class="w-full h-px bg-black"></div>
			<form
				class="w-4/5 px-2 pt-2 pb-4 space-y-3"
				method="POST"
				action="/leaderboard?/submit-entry"
				use:enhance={() => {
					submissionError = '';
					submitting = true;

					return async ({ result }) => {
						submitting = false;

						if (
							result.type === 'success' &&
							result.data?.errorMessage &&
							typeof result.data.errorMessage === 'string'
						) {
							submissionError = result.data.errorMessage;
						}

						if (result.type === 'failure' || result.type === 'error') {
							submissionError = 'An unexpected error has occured';
						}

						if (result.type === 'success' && !result.data?.errorMessage) {
							playerName = '';
							submitSuccessful = true;
						}
					};
				}}
			>
				<div class="flex flex-col space-y-1">
					<label for="playername" class="text-lg font-medium text-left">Player Name</label>
					<input
						id="playername"
						name="playername"
						class={cn(
							'w-full h-10 px-3 py-2 border border-black rounded-md focus-visible:outline-none',
							{
								'border-red-primary': !!submissionError,
							},
						)}
						bind:value={playerName}
					/>
					<p class="text-sm text-left text-red-primary">{submissionError}</p>
				</div>

				<button
					type="submit"
					disabled={!playerName}
					class="py-1.5 px-3 font-bold text-lg rounded-md bg-green-primary text-white w-full h-10 flex justify-center items-center disabled:opacity-50"
					>{#if submitting}<Loader2 class="text-white animate-spin" size={25} />{:else}Submit to
						leaderboard{/if}</button
				>
			</form>
		{/if}
	</div>
</dialog>
