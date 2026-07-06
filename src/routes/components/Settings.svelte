<script lang="ts">
	import { Settings } from 'lucide-svelte';
	import gsap, { Power1 } from 'gsap';
	import Modal from '$lib/components/Modal.svelte';
	import { updateSettings } from '$lib/remote/settings.remote';

	type Props = {
		enableEasterEggs: boolean;
	};

	let { enableEasterEggs }: Props = $props();

	$effect(() => {
		updateSettings.fields.set({
			enableEasterEggs,
		});
	});

	let formEl = $state<HTMLFormElement>();

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
			class="text-grey group-hover/settings:text-grey-dark transition-colors duration-500 sm:size-12 xs:size-10 size-8"
		/>
	</button>
{/snippet}

<Modal {button} headerClass="bg-grey" containerClass="text-center p-2" name="Settings">
	<form
		bind:this={formEl}
		class="flex items-center py-3 gap-x-3"
		{...updateSettings.enhance(async form => {
			try {
				await form.submit();
			} catch (error) {
				console.error(error);
			}
		})}
	>
		<label>
			<input
				disabled={!!updateSettings.pending}
				class="hover:cursor-pointer disabled:hover:cursor-auto"
				{...updateSettings.fields.enableEasterEggs.as('checkbox')}
				onchange={() => formEl?.requestSubmit()}
			/>
			Enable easter eggs
		</label>
	</form>
</Modal>
