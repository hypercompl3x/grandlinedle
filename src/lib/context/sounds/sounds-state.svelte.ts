import { Sound } from 'svelte-sound';
import type { SettingsState } from '$lib/context/settings/settings-state.svelte';
import hisashiburidanaMugiwara from '$lib/assets/hisashiburidana-mugiwara.mp3';
import theOnePieceIsReal from '$lib/assets/the-one-piece-is-real.m4a';
import goofy from '$lib/assets/goofy.m4a';
import shock from '$lib/assets/shock.m4a';
import haki from '$lib/assets/haki.m4a';
import kacha from '$lib/assets/kacha.m4a';
import binksSake from '$lib/assets/binks-sake.mp3';

type SoundKey =
	| 'hisashiburidanaMugiwara'
	| 'theOnePieceIsReal'
	| 'goofy'
	| 'shock'
	| 'haki'
	| 'kacha'
	| 'binksSake';

const SOUND_FILES: Record<SoundKey, string> = {
	kacha,
	goofy,
	shock,
	haki,
	hisashiburidanaMugiwara,
	theOnePieceIsReal,
	binksSake,
};

export class SoundsState {
	settings: SettingsState;

	hasInteracted = $state(false);
	ready = $state(false);
	sounds = $state<Partial<Record<SoundKey, Sound>>>({});

	private lastSoundEffectVolume: number | null = null;
	private lastMusicVolume: number | null = null;

	constructor(settings: SettingsState) {
		this.settings = settings;
	}

	init = () => {
		if (this.hasInteracted) return;

		this.hasInteracted = true;
		this.createSounds();
	};

	createSounds = () => {
		this.ready = false;
		this.lastSoundEffectVolume = this.settings.soundEffectVolume;
		this.lastMusicVolume = this.settings.musicVolume;

		this.sounds = {
			kacha: new Sound(SOUND_FILES.kacha, {
				volume: this.settings.soundEffectVolume,
			}),
			goofy: new Sound(SOUND_FILES.goofy, {
				volume: this.settings.soundEffectVolume,
			}),
			shock: new Sound(SOUND_FILES.shock, {
				volume: this.settings.soundEffectVolume,
			}),
			haki: new Sound(SOUND_FILES.haki, {
				volume: this.settings.soundEffectVolume,
			}),
			hisashiburidanaMugiwara: new Sound(SOUND_FILES.hisashiburidanaMugiwara, {
				volume: this.settings.soundEffectVolume,
			}),
			theOnePieceIsReal: new Sound(SOUND_FILES.theOnePieceIsReal, {
				volume: this.settings.soundEffectVolume,
			}),
			binksSake: new Sound(SOUND_FILES.binksSake, {
				volume: this.settings.musicVolume,
				loop: true,
			}),
		};

		setTimeout(() => {
			this.ready = true;
		}, 100);
	};

	private syncMusicVolumeBeforePlay = () => {
		if (this.lastMusicVolume === this.settings.musicVolume) return;

		this.lastMusicVolume = this.settings.musicVolume;
		this.sounds.binksSake?.stop();
		this.sounds.binksSake?.update({
			volume: this.settings.musicVolume,
			loop: true,
		});
	};

	refreshVolumes = () => {
		if (!this.hasInteracted) return;
		if (this.lastSoundEffectVolume === this.settings.soundEffectVolume) return;

		this.lastSoundEffectVolume = this.settings.soundEffectVolume;
		this.sounds.kacha?.update({ volume: this.settings.soundEffectVolume });
		this.sounds.goofy?.update({ volume: this.settings.soundEffectVolume });
		this.sounds.shock?.update({ volume: this.settings.soundEffectVolume });
		this.sounds.haki?.update({ volume: this.settings.soundEffectVolume });
		this.sounds.hisashiburidanaMugiwara?.update({ volume: this.settings.soundEffectVolume });
		this.sounds.theOnePieceIsReal?.update({ volume: this.settings.soundEffectVolume });
	};

	play = (key: SoundKey) => {
		if (!this.hasInteracted || !this.ready) return;

		if (key === 'binksSake') {
			this.syncMusicVolumeBeforePlay();
		}

		const sound = this.sounds[key];

		setTimeout(() => {
			sound?.stop();
			sound?.play();
		}, 100);
	};

	stop = (key: SoundKey) => {
		const sound = this.sounds[key];

		sound?.stop();
	};
}
