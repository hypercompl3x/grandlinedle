<script lang="ts">
	import { Lightbulb, Loader2 } from 'lucide-svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { submitFeedback } from '$lib/remote/feedback.remote';
	import { cn } from '$lib/utils/helpers';
	import SanjiThanksZeff from '$lib/assets/sanji-thanks-zeff.webp';
</script>

{#snippet button(onClick: () => void)}
	<button
		type="button"
		onclick={onClick}
		class="flex items-center gap-x-1 rounded-full from-blue-light to-blue-primary bg-linear-to-b px-2 py-1 text-sm font-bold hover:brightness-110 shadow-xs"
	>
		<Lightbulb class="size-3.5 stroke-3" />
		Feedback
	</button>
{/snippet}

<Modal
	{button}
	headerClass="bg-blue-primary"
	containerClass="text-center p-2"
	name="Feedback"
	disableClose={!!submitFeedback.pending}
>
	{#if submitFeedback.result?.success}
		<div class="w-4/5 pt-2 pb-4 space-y-2">
			<p class="font-bold">Thank you for your feedback!</p>
			<img alt="Sanji thanks Zeff" src={SanjiThanksZeff} class="rounded-md" />
		</div>
	{:else}
		<form class="w-4/5 pt-2 pb-4 space-y-3 text-center" {...submitFeedback}>
			{#if submitFeedback.result?.success === false}
				<p class="text-base text-red-primary">Something unexpected happened. Please try again!</p>
			{/if}
			<div class="flex flex-col space-y-1 w-full">
				<label class="text-lg font-medium text-left">
					Feedback
					<span class="text-red-primary">*</span>
					<textarea
						{...submitFeedback.fields.feedback.as('text')}
						rows={3}
						class={cn(
							'w-full px-3 py-2 border border-black rounded-md focus-visible:outline-hidden mt-0.5 resize-none',
							{
								'border-red-primary': !!submitFeedback.fields.feedback.issues(),
							},
						)}
					></textarea>
				</label>
				<p class="text-sm text-left text-red-primary">
					{submitFeedback.fields.feedback.issues()?.[0].message}
				</p>
			</div>
			<div class="flex flex-col space-y-1 w-full">
				<label class="text-lg font-medium text-left">
					Display name
					<input
						{...submitFeedback.fields.displayName.as('text')}
						class={cn(
							'w-full h-10 px-3 py-2 border border-black rounded-md focus-visible:outline-hidden mt-0.5',
							{
								'border-red-primary': !!submitFeedback.fields.displayName.issues(),
							},
						)}
					/>
				</label>
				<p class="text-sm text-left text-red-primary">
					{submitFeedback.fields.displayName.issues()?.[0].message}
				</p>
			</div>
			<button
				type="submit"
				class="flex items-center w-full gap-x-2 justify-center h-12 from-blue-light to-blue-primary bg-linear-to-b text-white rounded-md font-semibold text-2xl enabled:hover:brightness-110 disabled:opacity-50 px-2"
				disabled={!submitFeedback.fields.feedback.value() || !!submitFeedback.pending}
			>
				{#if !!submitFeedback.pending}
					<Loader2 class="text-white animate-spin" size={25} />
				{:else}
					Submit
				{/if}
			</button>
		</form>
	{/if}
</Modal>
