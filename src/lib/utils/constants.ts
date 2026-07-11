import Conquerors from "$lib/assets/conqueror's.png";
import Armament from '$lib/assets/armament.png';
import Observation from '$lib/assets/observation.png';

export const COLUMNS = [
	'Character',
	'Gender',
	'Affiliation',
	'Devil Fruit',
	'Haki',
	'Last Bounty',
	'Height',
	'Origin',
	'First Arc',
];

export const HAKI_MAP: Record<string, string> = {
	"Conqueror's": Conquerors,
	Armament: Armament,
	Observation: Observation,
};

export const ARCS: string[] = [
	'Romance Dawn',
	'Orange Town',
	'Syrup Village',
	'Baratie',
	'Arlong Park',
	'Loguetown',
	'Reverse Mountain',
	'Whiskey Peak',
	'Little Garden',
	'Drum Island',
	'Alabasta',
	'Jaya',
	'Skypiea',
	'Long Ring Long Land',
	'Water 7',
	'Enies Lobby',
	'Post-Enies Lobby',
	'Thriller Bark',
	'Sabaody Archipelago',
	'Amazon Lily',
	'Impel Down',
	'Marineford',
	'Post-War',
	'Return to Sabaody',
	'Fish-Man Island',
	'Punk Hazard',
	'Dressrosa',
	'Zou',
	'Whole Cake Island',
	'Reverie',
	'Wano Country',
	'Egghead',
	'Elbaph',
];

export const GAME_MODE = {
	CHARACTER: 'character',
	LOCATION: 'location',
	QUOTE: 'quote',
	CREW: 'crew',
} as const;

export const NUMBER_OF_GAME_MODES = Object.values(GAME_MODE).length;

export const COOKIE = {
	LOCATIONS: 'locations',
	CHARACTERS: 'characters',
	QUOTE_CHARACTERS: 'quotecharacters',
	COMPLETED: 'completed',
	SUBMITTED_ENTRY: 'submittedentry',
	PLAYER_NAME: 'playername',
	CREWS: 'crews',
	LOCATION_HARD_MODE: 'locationhardmode',
	ENABLE_EASTER_EGGS: 'enableeastereggs',
} as const;

export const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export const SEARCH_MAP = {
	character: {
		noItemsFoundMessage: 'No characters found',
		searchPlaceholder: 'Search for a character...',
		buttonName: 'characterId',
	},
	location: {
		noItemsFoundMessage: 'No locations found',
		searchPlaceholder: 'Search for a location...',
		buttonName: 'locationId',
	},
	quote: {
		noItemsFoundMessage: 'No characters found',
		searchPlaceholder: 'Search for a character...',
		buttonName: 'characterId',
	},
	crew: {
		noItemsFoundMessage: 'No crews found',
		searchPlaceholder: 'Search for a crew...',
		buttonName: 'crewId',
	},
} as const;

export const DEVELOPER_EMAIL = 'hypercompl3x@gmail.com';

export const SOLO_LINKS = [
	{ name: 'Classic', href: '/classic', icon: '❓' },
	{ name: 'Location', href: '/location', icon: '🌍' },
	{ name: 'Quote', href: '/quote', icon: '💬' },
	{ name: 'Crew', href: '/crew', icon: '🏴‍☠️' },
	{ name: 'Rankings', href: '/rankings', icon: '🏆' },
] as const;

export const ONLINE_LINKS = [{ name: 'Online', href: '/online', icon: '⚔️' }] as const;

export const GENERIC_ERROR = 'An unexpected error has occured';

export const MAX_ONLINE_PLAYER_COUNT = 8;

export const NUMBER_OF_ROUNDS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
export const GUESS_TIME_OPTIONS = [5, 10, 15, 20, 25, 30];

export const MAX_GUESSES = 8;

export const TIMER = {
	REVEAL: 3,
	RESULTS: 5,
};

export const ICON = {
	MIN: 1,
	MAX: 38,
	FOXY: 39,
};

export const GAME_STATUSES = {
	LOBBY: 'lobby',
	IN_GAME: 'in_game',
	RESULTS: 'results',
} as const;
