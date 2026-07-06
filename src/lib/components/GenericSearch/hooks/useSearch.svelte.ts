import type { FormEventHandler } from 'svelte/elements';
import type { SubmitFunction } from '@sveltejs/kit';
import { invalidateAll } from '$app/navigation';
import { applyAction } from '$app/forms';
import { Sound } from 'svelte-sound';
import useAsyncTransition from '$lib/hooks/useAsyncTransition.svelte';
import { getEasterEggCharacters } from '$lib/services/characterService';
import type { CharacterWithImage, Crew, Location } from '$lib/types/DatabaseTypes';
import type { Page } from '$lib/types/SearchTypes';
import hisashiburidanaMugiwara from '$lib/assets/hisashiburidana-mugiwara.mp3';
import theOnePieceIsReal from '$lib/assets/the-one-piece-is-real.m4a';

let hisashiburidanaMugiwaraSound: Sound | undefined;
let theOnePieceIsRealSound: Sound | undefined;

const useSearch = <T extends CharacterWithImage | Location | Crew>(
	page: Page,
	buttonName: string,
	getItemsFromQuery: (query: string, guessIds: T['id'][]) => Promise<T[]>,
	enableEasterEggs: () => boolean,
	guessIds: () => T['id'][],
) => {
	let isDropdownOpen = $state(false);
	let query = $state('');
	let items = $state<T[]>([]);
	let filteredItems = $state<T[]>([]);
	let form = $state<HTMLFormElement>();

	const transition = useAsyncTransition();

	let currentSearchPromise = Promise.resolve();

	const updateAllItems = (newItems: T[]) => {
		items = newItems;
		filteredItems = newItems;
	};

	const handleSearch: FormEventHandler<HTMLInputElement> = async e => {
		if (!hisashiburidanaMugiwaraSound) {
			hisashiburidanaMugiwaraSound = new Sound(hisashiburidanaMugiwara, {
				volume: 0.7,
			});
		}

		if (!theOnePieceIsRealSound) {
			theOnePieceIsRealSound = new Sound(theOnePieceIsReal, {
				volume: 0.7,
			});
		}

		const { value } = e.currentTarget;
		const oldQuery = query;

		isDropdownOpen = true;
		query = value;

		await currentSearchPromise;

		if (query.toLowerCase().includes('hyde') && page === 'character' && enableEasterEggs()) {
			const newItems = await getEasterEggCharacters(guessIds());
			updateAllItems(newItems as T[]);
			return;
		}

		if (query.toLowerCase() === 'mugiwara' && page === 'character' && enableEasterEggs()) {
			hisashiburidanaMugiwaraSound.stop();
			hisashiburidanaMugiwaraSound.play();
			updateAllItems([]);
			return;
		}

		if (query.toLowerCase() === 'laugh tale' && page === 'location' && enableEasterEggs()) {
			theOnePieceIsRealSound.stop();
			theOnePieceIsRealSound.play();
			updateAllItems([]);
			return;
		}

		if (!query) {
			updateAllItems([]);
			return;
		}

		if (oldQuery[0] === value[0]) {
			filteredItems = items.filter(item => item.name.toLowerCase().includes(value.toLowerCase()));
			return;
		}

		currentSearchPromise = transition.startTransition(async () => {
			const newItems = await getItemsFromQuery(query, guessIds());
			updateAllItems(newItems.filter(i => i.id < 9000));
		});
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && form) {
			e.preventDefault();
			form.requestSubmit();
		}
	};

	const pickItem: SubmitFunction = ({ submitter, cancel, formData }) => {
		if (!submitter) {
			const firstItem = filteredItems[0];

			if (!firstItem) {
				cancel();
				return;
			}

			formData.set(buttonName, firstItem.id.toString());
		}
		return async ({ result }) => {
			updateAllItems([]);
			isDropdownOpen = false;
			query = '';

			await invalidateAll();
			await applyAction(result);
		};
	};

	return {
		get isDropdownOpen() {
			return isDropdownOpen;
		},
		set isDropdownOpen(value) {
			isDropdownOpen = value;
		},
		get query() {
			return query;
		},
		get filteredItems() {
			return filteredItems;
		},
		get form() {
			return form;
		},
		set form(value) {
			form = value;
		},
		transition,
		pickItem,
		handleSearch,
		handleKeyDown,
	};
};

export default useSearch;
