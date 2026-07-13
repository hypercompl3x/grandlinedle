<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Settings, Check } from 'lucide-svelte';
	import { Checkbox, Label } from 'bits-ui';
	import gsap, { Power1 } from 'gsap';
	import Modal from '$lib/components/Modal.svelte';
	import Slider from '$lib/components/Slider.svelte';
	import Button from '$lib/components/Button.svelte';
	import { updateSettings } from '$lib/remote/settings.remote';
	import { getSettings } from '$lib/context/settings/settings-context';

	const settings = getSettings();

	let saving = $state(false);
	let volume = $derived(settings.volume);
	let enableEasterEggs = $derived(settings.enableEasterEggs);

	const getEnableEasterEggs = () => {
		return enableEasterEggs;
	};

	const setEnableEasterEggs = (newEnableEasterEggs: boolean) => {
		enableEasterEggs = newEnableEasterEggs;
	};

	const saveSettings = async () => {
		try {
			saving = true;
			await updateSettings({ enableEasterEggs, volume });
			await invalidateAll();
		} finally {
			saving = false;
		}
	};

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

<Modal
	{button}
	headerClass="bg-grey"
	containerClass="text-center px-8 py-4"
	name="Settings"
	disableClose={saving}
>
	<div class="space-y-6 w-full">
		<Slider
			label="Volume"
			bind:slide={volume}
			slides={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]}
			disabled={saving}
		/>
		<div class="flex items-center space-x-3">
			<Checkbox.Root
				id="enableEasterEggs"
				aria-labelledby="enableEasterEggs-label"
				class="border-muted bg-red-primary data-[state=unchecked]:border-border-input data-[state=unchecked]:bg-white data-[state=unchecked]:hover:border-dark-40 peer inline-flex size-6.25 items-center justify-center rounded-md border transition-all duration-150 ease-in-out active:scale-[0.98]"
				bind:checked={getEnableEasterEggs, setEnableEasterEggs}
				disabled={saving}
			>
				{#snippet children({ checked })}
					{#if checked}
						<div class="text-white inline-flex items-center justify-center ring-0">
							<Check class="w-5 stroke-3" />
						</div>
					{/if}
				{/snippet}
			</Checkbox.Root>
			<Label.Root
				id="enableEasterEggs-label"
				for="enableEasterEggs"
				class="text-lg font-medium leading-none peer-disabled:cursor-not-allowed"
			>
				Enable easter eggs
			</Label.Root>
		</div>
		<Button
			type="button"
			onclick={saveSettings}
			class="from-grey to-grey-dark"
			submitting={saving}
			disabled={settings.volume === volume && settings.enableEasterEggs === enableEasterEggs}
		>
			Save
		</Button>
	</div>
</Modal>
