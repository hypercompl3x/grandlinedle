import type { FormEventHandler } from 'svelte/elements';
import type { SubmitFunction } from '@sveltejs/kit';
import { invalidateAll } from '$app/navigation';
import { applyAction } from '$app/forms';
import useAsyncTransition from '$lib/hooks/useAsyncTransition.svelte';
import { getEasterEggCharacters } from '$lib/services/characterService';
import { getSounds } from '$lib/context/sounds/sounds-context';
import { getSettings } from '$lib/context/settings/settings-context';
import type { CharacterWithImage, Crew, Location } from '$lib/types/DatabaseTypes';
import type { Page } from '$lib/types/SearchTypes';

const useSearch = <T extends CharacterWithImage | Location | Crew>(
	page: Page,
	buttonName: string,
	getItemsFromQuery: (query: string, guessIds: T['id'][]) => Promise<T[]>,
	guessIds: () => T['id'][],
) => {
	const sounds = getSounds();
	const settings = getSettings();

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
		const { value } = e.currentTarget;
		const oldQuery = query;

		isDropdownOpen = true;
		query = value;

		await currentSearchPromise;

		if (query.toLowerCase().includes('hyde') && page === 'character' && settings.enableEasterEggs) {
			const newItems = await getEasterEggCharacters(guessIds());
			updateAllItems(newItems as T[]);
			return;
		}

		if (query.toLowerCase() === 'mugiwara' && page === 'character' && settings.enableEasterEggs) {
			const newItems = await getItemsFromQuery('Monkey D. Luffy', guessIds());
			sounds.play('hisashiburidanaMugiwara');
			updateAllItems(newItems);
			return;
		}

		if (query.toLowerCase() === 'laugh tale' && page === 'location' && settings.enableEasterEggs) {
			sounds.play('theOnePieceIsReal');
			updateAllItems([]);
			return;
		}

		if (!query) {
			updateAllItems([]);
			return;
		}

		if (oldQuery[0] === value[0]) {
			filteredItems = items.filter(
				item => item.name.toLowerCase().includes(value.toLowerCase()) && item.id < 9000,
			);
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
