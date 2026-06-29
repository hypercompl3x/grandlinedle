<script lang="ts">
	import { Settings } from 'lucide-svelte';
	import gsap, { Power1 } from 'gsap';
	import { invalidateAll } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';

	type Props = {
		hideSuggestionBanner: boolean;
	};

	let { hideSuggestionBanner }: Props = $props();

	let submitting = $state(false);

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
			submitting = true;
			await fetch(`/api/settings?hideSuggestionBanner=${checked}`, {
				method: 'POST',
			});
			await invalidateAll();
		} catch (error) {
			console.error(error);
		} finally {
			submitting = false;
		}
	};
</script>

{#snippet button(onClick: () => void)}
	<button
		type="button"
		onclick={onClick}
		onmouseenter={onMouseEnter}
		onmouseleave={onMouseLeave}
		class="h-fit group/settings"
	>
		<Settings
			id="settings-icon"
			size={40}
			class="text-grey group-hover/settings:text-grey-dark transition-colors duration-500"
		/>
	</button>
{/snippet}

<Modal {button} headerClass="bg-grey" containerClass="text-center" name="Settings">
	<div class="flex items-center py-3 gap-x-3">
		<input
			id="hidesuggestionbanner"
			type="checkbox"
			disabled={submitting}
			checked={hideSuggestionBanner}
			class="hover:cursor-pointer disabled:hover:cursor-auto peer"
			onchange={e => handleCheck(e.currentTarget.checked)}
		/>
		<label for="hidesuggestionbanner" class="hover:cursor-pointer peer-disabled:hover:cursor-auto">
			Hide suggestion banner
		</label>
	</div>
</Modal>
