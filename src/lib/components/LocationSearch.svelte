<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { FormEventHandler } from 'svelte/elements';
	import { applyAction, enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Loader2, Search } from 'lucide-svelte';
	import type { Location } from '$lib/types/DatabaseTypes';
	import asyncTransition from '$lib/utils/asyncTransition.svelte';
	import { getLocationsFromQuery } from '$lib/services/locationService';

	type DropdownItem = {
		name: Location['name'];
		id: Location['id'];
	};

	type Props = {
		guessIds: Location['id'][];
		gettingNewData: boolean;
	};

	let { guessIds, gettingNewData }: Props = $props();

	const transition = asyncTransition();

	let containerEl = $state<HTMLDivElement>();
	let isDropdownOpen = $state(false);
	let query = $state('');
	let locations = $state<Location[]>([]);
	let filteredLocations = $state<Location[]>([]);

	let currentSearchPromise = Promise.resolve();

	const handleClick = (e: Event) => {
		if (containerEl && !containerEl.contains(e?.target as Node)) {
			isDropdownOpen = false;
		}
	};

	const updateAllLocations = (newLocations: Location[]) => {
		locations = newLocations;
		filteredLocations = newLocations;
	};

	const handleSearch: FormEventHandler<HTMLInputElement> = async e => {
		await currentSearchPromise;

		const oldQuery = query;
		const { value } = e.currentTarget;

		isDropdownOpen = true;
		query = value;

		if (!query) {
			updateAllLocations([]);
			return;
		}

		if (oldQuery[0] === value[0]) {
			filteredLocations = locations.filter(location =>
				location.name.toLowerCase().includes(value.toLowerCase()),
			);
			return;
		}

		currentSearchPromise = transition.startTransition(async () => {
			const newLocations = await getLocationsFromQuery(query, guessIds);
			updateAllLocations(newLocations);
		});
	};

	const pickLocation: SubmitFunction = () => {
		return async ({ result }) => {
			updateAllLocations([]);
			isDropdownOpen = false;
			query = '';

			await invalidateAll();
			await applyAction(result);
		};
	};

	$effect(() => {
		document.addEventListener('click', handleClick);
		document.addEventListener('touchstart', handleClick);

		return () => {
			document.removeEventListener('click', handleClick);
			document.removeEventListener('touchstart', handleClick);
		};
	});
</script>

{#snippet dropdownItem({id, name}: DropdownItem)}
	<button
		name="locationId"
		type="submit"
		value={id}
		class="flex items-center w-full px-4 py-2 text-xl font-bold hover:bg-white gap-x-5 focus-visible:outline-none focus:bg-white"
	>
		{name}
	</button>
{/snippet}

<div class="w-full px-4 max-w-96">
	<div bind:this={containerEl} class="relative">
		<input
			type="text"
			oninput={handleSearch}
			value={query}
			onclick={() => (isDropdownOpen = true)}
			disabled={gettingNewData}
			placeholder="Search for a location..."
			class="flex w-full py-2 pl-3 pr-10 text-sm border border-black rounded-md focus-visible:outline-none disabled:bg-white"
		/>
		{#if gettingNewData}
			<Loader2 size={20} class="absolute inset-y-0 my-auto right-3 animate-spin" />
		{:else}
			<Search size={20} class="absolute inset-y-0 my-auto right-3" />
		{/if}
		{#if isDropdownOpen && query}
			<form
				use:enhance={pickLocation}
				method="POST"
				class="absolute top-[38px] bg-white bg-opacity-95 inset-x-0 mx-auto rounded-md overflow-hidden max-h-80 overflow-y-auto z-20"
			>
				{#if transition.isPending}
					<div class="flex items-center w-full h-20 px-4 text-xl font-bold animate-pulse">
						Searching...
					</div>
				{:else if filteredLocations.length === 0}
					<div class="flex items-center w-full h-20 px-4 text-xl font-bold">No locations found</div>
				{:else}
					{#each filteredLocations as location (`${location.id}-dropdown-item`)}
						{@const { name, id } = location}
						{@render dropdownItem({ name, id })}
					{/each}
				{/if}
			</form>
		{/if}
	</div>
</div>
