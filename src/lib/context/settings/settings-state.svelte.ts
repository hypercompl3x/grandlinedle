type SettingsStateArgs = {
	enableEasterEggs: boolean;
	soundEffectVolume: number;
	musicVolume: number;
};

export class SettingsState {
	enableEasterEggs = $state<boolean>()!;
	soundEffectVolume = $state<number>()!;
	musicVolume = $state<number>()!;

	constructor(args: SettingsStateArgs) {
		this.enableEasterEggs = args.enableEasterEggs;
		this.soundEffectVolume = args.soundEffectVolume;
		this.musicVolume = args.musicVolume;
	}

	update(settings: SettingsStateArgs) {
		this.enableEasterEggs = settings.enableEasterEggs;
		this.soundEffectVolume = settings.soundEffectVolume;
		this.musicVolume = settings.musicVolume;
	}
}
