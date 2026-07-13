<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Sound } from 'svelte-sound';
	import { Loader2 } from 'lucide-svelte';
	import { getSettings } from '$lib/context/settings/settings-context';
	import { cn } from '$lib/utils/helpers';
	import kacha from '$lib/assets/kacha.m4a';
	import { untrack } from 'svelte';

	type Props = HTMLButtonAttributes & {
		submitting?: boolean;
	};

	let {
		class: buttonClass,
		disabled = false,
		submitting = false,
		children,
		onclick,
		onsubmit,
		...rest
	}: Props = $props();

	const settings = getSettings();

	let kachaSound = $state<Sound>();

	$effect(() => {
		const oldKatchaSound = untrack(() => kachaSound);
		if (!oldKatchaSound) return;

		kachaSound = new Sound(kacha, {
			volume: settings.volume,
		});
	});

	const initKacha = () => {
		if (kachaSound) return;

		kachaSound = new Sound(kacha, {
			volume: settings.volume,
		});
	};

	const playKacha = () => {
		if (!kachaSound) return;

		kachaSound.stop();
		kachaSound.play();
	};
</script>

<button
	onpointerdown={initKacha}
	onkeydown={initKacha}
	onclick={e => {
		playKacha();
		onclick?.(e);
	}}
	class={cn(
		'flex items-center w-full gap-x-2 justify-center h-12 from-blue-light to-blue-primary bg-linear-to-b text-white rounded-md font-semibold text-2xl enabled:hover:brightness-110 disabled:opacity-50 px-2',
		buttonClass,
	)}
	disabled={disabled || submitting}
	{...rest}
>
	{#if submitting}
		<Loader2 class="text-white animate-spin" size={25} />
	{:else}
		{@render children?.()}
	{/if}
</button>
