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
	'First Saga',
];

export const HAKI_MAP: Record<string, string> = {
	"Conqueror's": Conquerors,
	Armament: Armament,
	Observation: Observation,
};

export const SAGA_MAP: Record<string, number> = {
	'East Blue': 0,
	Alabasta: 1,
	'Sky Island': 2,
	'Water 7': 3,
	'Thriller Bark': 4,
	'Summit War': 5,
	'Fish-Man Island': 6,
	Dressrosa: 7,
	'Whole Cake Island': 8,
	'Wano Country': 9,
};
