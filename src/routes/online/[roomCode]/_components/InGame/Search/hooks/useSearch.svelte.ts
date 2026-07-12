import type { FormEventHandler } from 'svelte/elements';
import type { SubmitFunction } from '@sveltejs/kit';
import { applyAction } from '$app/forms';
import useAsyncTransition from '$lib/hooks/useAsyncTransition.svelte';
import { getCharactersFromQuery } from '$lib/services/characterService';
import type { CharacterWithImage } from '$lib/types/DatabaseTypes';

const useSearch = (guessIds: () => CharacterWithImage['id'][]) => {
	let isDropdownOpen = $state(false);
	let query = $state('');
	let items = $state<CharacterWithImage[]>([]);
	let filteredItems = $state<CharacterWithImage[]>([]);
	let form = $state<HTMLFormElement>();
	let submitting = $state(false);

	const transition = useAsyncTransition();

	let currentSearchPromise = Promise.resolve();

	const updateAllItems = (newItems: CharacterWithImage[]) => {
		items = newItems;
		filteredItems = newItems;
	};

	const handleSearch: FormEventHandler<HTMLInputElement> = async e => {
		const { value } = e.currentTarget;
		const oldQuery = query;

		isDropdownOpen = true;
		query = value;

		await currentSearchPromise;

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
			const newItems = await getCharactersFromQuery(query, guessIds());
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
		submitting = true;

		if (!submitter) {
			const firstItem = filteredItems[0];

			if (!firstItem) {
				cancel();
				return;
			}

			formData.set('characterId', firstItem.id.toString());
		}

		return async ({ result }) => {
			updateAllItems([]);
			isDropdownOpen = false;
			query = '';
			submitting = false;

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
		get submitting() {
			return submitting;
		},
		transition,
		pickItem,
		handleSearch,
		handleKeyDown,
	};
};

export default useSearch;
