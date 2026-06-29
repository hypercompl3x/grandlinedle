<script lang="ts">
	import { Settings, X } from 'lucide-svelte';
	import gsap, { Power1 } from 'gsap';
	import { invalidateAll } from '$app/navigation';

	type Props = {
		hideSuggestionBanner: boolean;
	};

	let { hideSuggestionBanner }: Props = $props();

	let updatingHideSuggestionBanner = $state(false);

	let dialog = $state<HTMLDialogElement>();

	const onMouseEnter = () => {
		gsap.to('#settings-icon', {
			rotation: 140,
			transformOrigin: '50% 50%',
			duration: 1,
			ease: Power1.easeOut,
		});
	};
	const onMouseLeave = () => {
		gsap.to('#settings-icon', {
			rotation: 0,
			transformOrigin: '50% 50%',
			duration: 1,
			ease: Power1.easeOut,
		});
	};

	const handleCheck = async (checked: boolean) => {
		try {
			updatingHideSuggestionBanner = true;
			await fetch(`/api/settings?hideSuggestionBanner=${checked}`, {
				method: 'POST',
			});
			await invalidateAll();
		} catch (error) {
			console.error(error);
		} finally {
			updatingHideSuggestionBanner = false;
		}
	};
</script>

<button
	type="button"
	onclick={() => dialog?.showModal()}
	onmouseenter={onMouseEnter}
	onmouseleave={onMouseLeave}
	class="h-fit group/settings"
	><Settings
		id="settings-icon"
		size={40}
		class="text-grey group-hover/settings:text-grey-dark transition-colors duration-500"
	/></button
>

<dialog
	bind:this={dialog}
	class="w-[calc(100%-32px)] sm:w-full overflow-hidden rounded-md max-w-96 backdrop:bg-black backdrop:opacity-40 fixed inset-0 m-auto h-fit"
	onclick={e => {
		if (e.target === dialog) {
			dialog.close();
		}
	}}
>
	<div class="relative flex justify-center p-2 text-white bg-grey">
		<div class="text-xl font-semibold sm:text-3xl">Settings</div>
		<button
			type="button"
			onclick={() => dialog?.close()}
			class="absolute inset-y-0 focus:ring-0 focus:outline-hidden right-2"
			><X class="stroke-2 sm:stroke-[3px] size-6 sm:size-8" /></button
		>
	</div>
	<div class="flex flex-col items-center text-lg text-center">
		<div class="flex items-center py-3 gap-x-3">
			<input
				id="hidesuggestionbanner"
				type="checkbox"
				disabled={updatingHideSuggestionBanner}
				checked={hideSuggestionBanner}
				class="hover:cursor-pointer disabled:hover:cursor-auto peer"
				onchange={e => handleCheck(e.currentTarget.checked)}
			/><label
				for="hidesuggestionbanner"
				class="hover:cursor-pointer peer-disabled:hover:cursor-auto">Hide suggestion banner</label
			>
		</div>
	</div>
</dialog>
