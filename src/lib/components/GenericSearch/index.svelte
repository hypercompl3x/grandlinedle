<script lang="ts" generics="T extends {id: number, name: string, url?: string}">
	import { enhance } from '$app/forms';
	import { Loader2, Search } from 'lucide-svelte';
	import onClickOutside from '$lib/utils/onClickOutside.svelte';
	import search from './search.svelte';

	const SEARCH_MAP = {
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
	};

	type Props = {
		guessIds: T['id'][];
		gettingNewData: boolean;
		getItemsFromQuery: (query: string, guessIds: T['id'][]) => Promise<T[]>;
		page: keyof typeof SEARCH_MAP;
	};

	let { guessIds, gettingNewData, getItemsFromQuery, page }: Props = $props();

	const { noItemsFoundMessage, searchPlaceholder, buttonName } = SEARCH_MAP[page];

	const s = search(getItemsFromQuery, guessIds);
	const outside = onClickOutside(() => (s.isDropdownOpen = false));
</script>

{#snippet dropdownItem({id, name, url}: Pick<T, 'id' | 'name' | 'url'>)}
	<button
		name={buttonName}
		type="submit"
		value={id}
		class="flex items-center w-full px-4 py-2 text-xl font-bold hover:bg-white gap-x-5 focus-visible:outline-none focus:bg-white"
	>
		{#if url}
			<img src={url} alt={`${name} Image`} class="h-16 rounded-md" />
		{/if}
		{name}
	</button>
{/snippet}

<div class="w-full px-4 max-w-96">
	<div bind:this={outside.containerEl} class="relative">
		<input
			type="text"
			oninput={s.handleSearch}
			value={s.query}
			onclick={() => (s.isDropdownOpen = true)}
			disabled={gettingNewData}
			placeholder={searchPlaceholder}
			class="flex w-full py-2 pl-3 pr-10 text-sm border border-black rounded-md focus-visible:outline-none disabled:bg-white"
		/>
		{#if gettingNewData}
			<Loader2 size={20} class="absolute inset-y-0 my-auto right-3 animate-spin" />
		{:else}
			<Search size={20} class="absolute inset-y-0 my-auto right-3" />
		{/if}
		{#if s.isDropdownOpen && s.query}
			<form
				use:enhance={s.pickItem}
				method="POST"
				class="absolute top-[38px] bg-white bg-opacity-95 inset-x-0 mx-auto rounded-md overflow-hidden max-h-80 overflow-y-auto z-20"
			>
				{#if s.transition.isPending}
					<div class="flex items-center w-full h-20 px-4 text-xl font-bold animate-pulse">
						Searching...
					</div>
				{:else if s.filteredItems.length === 0}
					<div class="flex items-center w-full h-20 px-4 text-xl font-bold">
						{noItemsFoundMessage}
					</div>
				{:else}
					{#each s.filteredItems as item (`${item.id}-dropdown-item`)}
						{@const { name, id, url } = item}
						{@render dropdownItem({ name, id, url })}
					{/each}
				{/if}
			</form>
		{/if}
	</div>
</div>
