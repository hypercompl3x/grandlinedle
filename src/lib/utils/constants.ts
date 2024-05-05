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
