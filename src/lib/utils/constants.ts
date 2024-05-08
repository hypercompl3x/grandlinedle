import { tick } from 'svelte';
import gsap, { Power2 } from 'gsap';
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

export const animateNewItem = async (playerHasWon: boolean, variant: 'character' | 'location') => {
	await tick();

	const tl = gsap.timeline({
		onComplete: () => {
			if (playerHasWon) {
				const successEl = document.getElementById(`success`);
				successEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		},
		defaults: { opacity: 0, ease: Power2.easeInOut, duration: 0.6 },
	});

	if (variant === 'character') {
		tl.from('#gender-0', {})
			.from('#affiliation-0', {})
			.from('#devil_fruit-0', {})
			.from('#haki-0', {})
			.from('#last_bounty-0', {})
			.from('#height-0', {})
			.from('#origin-0', {})
			.from('#first_saga-0', {});
	} else {
		tl.from('#location-0', {});
	}
};
