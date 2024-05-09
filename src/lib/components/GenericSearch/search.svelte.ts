import type { FormEventHandler } from 'svelte/elements';
import asyncTransition from '$lib/utils/asyncTransition.svelte';
import type { SubmitFunction } from '@sveltejs/kit';
import { invalidateAll } from '$app/navigation';
import { applyAction } from '$app/forms';

const search = <T extends { id: number; name: string; url?: string }>(
	getItemsFromQuery: (query: string, guessIds: T['id'][]) => Promise<T[]>,
	guessIds: T['id'][],
) => {
	let isDropdownOpen = $state(false);
	let query = $state('');
	let items = $state<T[]>([]);
	let filteredItems = $state<T[]>([]);

	const transition = asyncTransition();

	let currentSearchPromise = Promise.resolve();

	const updateAllItems = (newItems: T[]) => {
		items = newItems;
		filteredItems = newItems;
	};

	const handleSearch: FormEventHandler<HTMLInputElement> = async e => {
		await currentSearchPromise;

		const oldQuery = query;
		const { value } = e.currentTarget;

		isDropdownOpen = true;
		query = value;

		if (!query) {
			updateAllItems([]);
			return;
		}

		if (oldQuery[0] === value[0]) {
			filteredItems = items.filter(item => item.name.toLowerCase().includes(value.toLowerCase()));
			return;
		}

		currentSearchPromise = transition.startTransition(async () => {
			const newItems = await getItemsFromQuery(query, guessIds);
			updateAllItems(newItems);
		});
	};

	const pickItem: SubmitFunction = () => {
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
		transition,
		pickItem,
		handleSearch,
	};
};

export default search;
