<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import PatchNotes from './_components/PatchNotes.svelte';
	import Settings from './_components/Settings.svelte';
	import { setSettings } from '$lib/context/settings/settings-context';
	import { SettingsState } from '$lib/context/settings/settings-state.svelte';
	import { setSounds } from '$lib/context/sounds/sounds-context';
	import { SoundsState } from '$lib/context/sounds/sounds-state.svelte';
	import { cn } from '$lib/utils/helpers';
	import '@fontsource-variable/dm-sans/wght.css';
	import '../app.css';

	let { children, data }: LayoutProps = $props();

	const settings = setSettings(
		untrack(
			() =>
				new SettingsState({
					enableEasterEggs: data.enableEasterEggs,
					soundEffectVolume: data.soundEffectVolume,
					musicVolume: data.musicVolume,
				}),
		),
	);
	const sounds = setSounds(new SoundsState(settings));

	$effect(() => {
		const initSounds = () => {
			sounds.init();
		};

		window.addEventListener('pointerdown', initSounds, { once: true });
		window.addEventListener('keydown', initSounds, { once: true });
		window.addEventListener('touchstart', initSounds, { once: true });

		return () => {
			window.removeEventListener('pointerdown', initSounds);
			window.removeEventListener('keydown', initSounds);
			window.removeEventListener('touchstart', initSounds);
		};
	});

	$effect(() => {
		sounds.refreshVolumes();
	});

	$effect(() => {
		settings.update({
			enableEasterEggs: data.enableEasterEggs,
			soundEffectVolume: data.soundEffectVolume,
			musicVolume: data.musicVolume,
		});
	});
</script>

<div class="h-dvh min-h-dvh overflow-hidden overflow-y-auto">
	<div
		class={cn('flex flex-col items-center h-full mx-auto', {
			'max-w-(--breakpoint-lg)':
				page.route.id === '/(solo)/rankings' || page.route.id?.includes('/online'),
			'max-w-(--breakpoint-md)':
				page.route.id !== '/(solo)/rankings' && !page.route.id?.includes('/online'),
		})}
	>
		<div class="w-full flex justify-center items-center px-4 my-4">
			<PatchNotes />
			<button
				type="button"
				onclick={() => goto('/')}
				class="transition-transform duration-300 ease-in-out enabled:hover:scale-105"
				disabled={page.route.id === '/online/[roomCode]'}
			>
				<img alt="The grandlinedle logo" src="/grandlinedle-logo.png" class="w-96" />
			</button>
			<Settings />
		</div>
		{@render children()}
	</div>
</div>
