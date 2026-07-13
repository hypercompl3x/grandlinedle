type SettingsStateArgs = {
	enableEasterEggs: boolean;
	volume: number;
};

export class SettingsState {
	enableEasterEggs = $state<boolean>()!;
	volume = $state<number>()!;

	constructor(args: SettingsStateArgs) {
		this.enableEasterEggs = args.enableEasterEggs;
		this.volume = args.volume;
	}

	update(settings: SettingsStateArgs) {
		this.enableEasterEggs = settings.enableEasterEggs;
		this.volume = settings.volume;
	}
}
