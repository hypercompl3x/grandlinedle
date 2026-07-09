<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Loader2, PoundSterling, X } from 'lucide-svelte';
	import { cn } from '$lib/utils/helpers';
	import { supportGrandlinedle } from '$lib/remote/support.remote';
	import SanjiThanksZeff from '$lib/assets/sanji-thanks-zeff.webp';

	let dialog = $state<HTMLDialogElement>();

	const checkout = $derived(page.url.searchParams.get('checkout'));

	let previousCheckout = $state(false);

	$effect(() => {
		if (!dialog) return;

		const oldCheckout = untrack(() => previousCheckout);

		if (!!checkout && !oldCheckout) {
			if (!dialog.open) dialog.showModal();
		} else {
			if (dialog.open) dialog.close();
		}

		previousCheckout = !!checkout;
	});

	export const formatMoney = (amount: number) => {
		return new Intl.NumberFormat('en-GB').format(amount);
	};

	const clearCheckout = async () => {
		const nextUrl = new URL(page.url);
		nextUrl.searchParams.delete('checkout');

		await goto(nextUrl, {
			replaceState: true,
			noScroll: true,
			keepFocus: true,
		});
	};

	const closeDialog = async () => {
		if (!!supportGrandlinedle.pending) return;

		dialog?.close();

		if (!!checkout) {
			await clearCheckout();
		}
	};
</script>

<button
	type="button"
	onclick={() => dialog?.showModal()}
	class="flex items-center gap-x-1 rounded-full from-green-light to-green-primary bg-linear-to-b px-2 py-1 text-sm font-bold hover:brightness-110 shadow-xs"
>
	<PoundSterling class="size-3.5 stroke-3" />
	Support
</button>

<dialog
	bind:this={dialog}
	class="w-[calc(100%-32px)] sm:w-full overflow-hidden rounded-md max-w-96 backdrop:bg-black backdrop:opacity-40 fixed inset-0 m-auto h-fit"
	onclick={e => {
		if (e.target === dialog) {
			closeDialog();
		}
	}}
>
	<div class="relative flex justify-center p-2 text-white bg-green-primary">
		<div class="text-xl font-semibold sm:text-3xl">Support</div>
		<button
			type="button"
			disabled={!!supportGrandlinedle.pending}
			onclick={closeDialog}
			class="absolute inset-y-0 focus:ring-0 focus:outline-hidden right-2"
		>
			<X class="stroke-2 sm:stroke-[3px] size-6 sm:size-8" />
		</button>
	</div>
	<div class="flex flex-col items-center text-lg text-center">
		{#if checkout === 'success'}
			<div class="w-4/5 pt-2 pb-4 space-y-2">
				<p class="font-bold">Thank you for your contribution!</p>
				<img alt="Sanji thanks Zeff" src={SanjiThanksZeff} class="rounded-md" />
			</div>
		{:else}
			<div class="w-4/5 text-base p-2">
				<p class="font-semibold">Hey! Thanks for playing Grandlinedle.</p>
				<p>
					If you enjoy the daily games and want to support the work behind the site, you can leave a
					small contribution.
				</p>
			</div>
			<div class="w-full h-px bg-black"></div>
			<form class="w-4/5 pt-2 pb-4 space-y-3" {...supportGrandlinedle}>
				<div class="flex flex-col space-y-1 w-full">
					<label class="text-lg font-medium text-left">
						Amount
						<span class="text-red-primary">*</span>
						<div class="relative mt-0.5">
							<input
								{...supportGrandlinedle.fields.amount.as('number')}
								class={cn(
									'w-full h-10 pr-3 pl-6 py-2 border border-black rounded-md focus-visible:outline-hidden',
									{
										'border-red-primary': !!supportGrandlinedle.fields.amount.issues(),
									},
								)}
								pattern="[0-9]*"
								onbeforeinput={e => {
									if (e.data && /\D/.test(e.data)) {
										e.preventDefault();
									}
								}}
							/>
							<p class="absolute my-auto inset-y-0 left-2 h-fit">£</p>
						</div>
					</label>
					<p class="text-sm text-left text-red-primary">
						{supportGrandlinedle.fields.amount.issues()?.[0].message}
					</p>
				</div>
				<div class="flex flex-col space-y-1 w-full">
					<label class="text-lg font-medium text-left">
						Display name
						<input
							{...supportGrandlinedle.fields.displayName.as('text')}
							class={cn(
								'w-full h-10 px-3 py-2 border border-black rounded-md focus-visible:outline-hidden mt-0.5',
								{
									'border-red-primary': !!supportGrandlinedle.fields.displayName.issues(),
								},
							)}
						/>
					</label>
					<p class="text-sm text-left text-red-primary">
						{supportGrandlinedle.fields.displayName.issues()?.[0].message}
					</p>
				</div>
				<div class="flex flex-col space-y-1 w-full">
					<label class="text-lg font-medium text-left">
						Your message
						<textarea
							{...supportGrandlinedle.fields.yourMessage.as('text')}
							rows={3}
							class={cn(
								'w-full px-3 py-2 border border-black rounded-md focus-visible:outline-hidden mt-0.5 resize-none',
								{
									'border-red-primary': !!supportGrandlinedle.fields.yourMessage.issues(),
								},
							)}
						></textarea>
					</label>
					<p class="text-sm text-left text-red-primary">
						{supportGrandlinedle.fields.yourMessage.issues()?.[0].message}
					</p>
				</div>

				<button
					type="submit"
					class="flex items-center w-full gap-x-2 justify-center h-12 from-green-light to-green-primary bg-linear-to-b text-white rounded-md font-semibold text-2xl enabled:hover:brightness-110 disabled:opacity-50 px-2"
					disabled={!supportGrandlinedle.fields.amount.value() || !!supportGrandlinedle.pending}
				>
					{#if !!supportGrandlinedle.pending}
						<Loader2 class="text-white animate-spin" size={25} />
					{:else}
						<span class="min-w-0 max-w-full truncate">
							Tip £{formatMoney(supportGrandlinedle.fields.amount.value() || 0)}
						</span>
					{/if}
				</button>
			</form>
		{/if}
	</div>
</dialog>
