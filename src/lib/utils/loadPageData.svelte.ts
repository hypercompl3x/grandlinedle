import { untrack, tick } from 'svelte';
import gsap, { Power2 } from 'gsap';
import type { Character, LocationWithImage } from '$lib/types/DatabaseTypes';

const animateNewItem = async (playerHasWon: boolean, variant: 'character' | 'location') => {
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

const getLocalImages = async <T extends { url: string }>(items: T[]): Promise<T[]> => {
	return await Promise.all(
		items.map(async item => {
			const res = await fetch(item.url, { method: 'GET' });

			if (!res.ok) return { ...item, url: '' };

			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			return {
				...item,
				url,
			};
		}),
	);
};

type Guess = {
	created_at: string;
	id: number;
	name: string;
	url: string;
};

type Data<T extends Guess> = CharacterPage<T> | LocationPage<T>;

type CharacterPage<T extends Guess> = { guesses: T[]; currentCharacter: Character };
type LocationPage<T extends Guess> = { guesses: T[]; currentLocation: LocationWithImage };

const isCharacterPage = <T extends Guess>(result: Data<T>): result is CharacterPage<T> => {
	return 'currentCharacter' in result;
};

const loadPageData = <T extends Guess, D extends Data<T>>(pageData: Promise<D>) => {
	let result = $state<D>();
	let gettingNewData = $state(false);

	$effect(() => {
		console.log(pageData);
		(async () => {
			try {
				const oldResult = untrack(() => result);

				gettingNewData = true;

				const newResult = await pageData;
				const guessesWithLocalImages = await getLocalImages(newResult.guesses);
				result = { ...newResult, guesses: guessesWithLocalImages };

				gettingNewData = false;

				const firstIdChanged = oldResult && oldResult.guesses?.[0]?.id !== result?.guesses?.[0]?.id;

				if (firstIdChanged) {
					const currentItemId = isCharacterPage(result)
						? result?.currentCharacter?.id
						: result?.currentLocation?.id;
					const playerHasWon = currentItemId === result?.guesses?.[0]?.id;

					const page = isCharacterPage(result) ? 'character' : 'location';
					await animateNewItem(playerHasWon, page);
				}
			} catch (error) {
				console.error(error);
			}
		})();
	});

	return {
		get result() {
			return result;
		},
		get gettingNewData() {
			return gettingNewData;
		},
	};
};

export default loadPageData;
