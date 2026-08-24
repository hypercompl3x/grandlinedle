<script lang="ts" generics="T extends CharacterWithImage | Location | Crew">
	import { enhance } from '$app/forms';
	import { Loader2, Search } from 'lucide-svelte';
	import useOnClickOutside from '$lib/hooks/useOnClickOutside.svelte';
	import useSearch from './hooks/useSearch.svelte';
	import { SEARCH_MAP } from '$lib/utils/constants';
	import type { CharacterWithImage, Crew, Location } from '$lib/types/DatabaseTypes';
	import type { Page } from '$lib/types/SearchTypes';

	type Props = {
		guessIds: T['id'][];
		gettingNewData: boolean;
		getItemsFromQuery: (query: string, guessIds: T['id'][]) => Promise<T[]>;
		page: Page;
	};

	let { page, getItemsFromQuery, gettingNewData, guessIds }: Props = $props();

	let { noItemsFoundMessage, searchPlaceholder, buttonName } = $derived(SEARCH_MAP[page]);

	// svelte-ignore state_referenced_locally
	const search = useSearch(page, buttonName, getItemsFromQuery, () => guessIds);
	const onClickOutside = useOnClickOutside(() => (search.isDropdownOpen = false));
</script>

{#snippet dropdownItem({ id, name, url }: { id: number; name: string; url?: string })}
	<button
		data-testid={`dropdown-item-${name}`}
		name={buttonName}
		type="submit"
		value={id}
		class="flex items-center w-full px-4 py-2 text-xl font-bold text-left hover:bg-blue-primary hover:text-white gap-x-5 focus-visible:outline-hidden focus:bg-blue-primary focus:text-white"
	>
		{#if url}
			<img src={url} alt={`${name} Image`} class="h-16 rounded-md" />
		{/if}
		{name}
	</button>
{/snippet}

<div class="w-full px-4 max-w-96">
	<div bind:this={onClickOutside.containerEl} class="relative">
		<input
			data-testid={`search-input-${page}`}
			type="text"
			oninput={search.handleSearch}
			onkeydown={search.handleKeyDown}
			value={search.query}
			onclick={() => (search.isDropdownOpen = true)}
			disabled={gettingNewData}
			placeholder={searchPlaceholder}
			class="flex w-full py-2 pl-3 pr-10 text-sm bg-white rounded-md focus-visible:outline-hidden shadow-md"
		/>
		{#if gettingNewData}
			<Loader2 size={20} class="absolute inset-y-0 my-auto right-3 animate-spin text-grey" />
		{:else}
			<Search size={20} class="absolute inset-y-0 my-auto right-3 text-grey" />
		{/if}
		{#if search.isDropdownOpen && search.query}
			<form
				bind:this={search.form}
				use:enhance={search.pickItem}
				method="POST"
				class="absolute top-9.5 bg-white inset-x-0 mx-auto rounded-md overflow-hidden max-h-80 overflow-y-auto z-20"
			>
				{#if search.transition.isPending}
					<div class="flex items-center w-full h-20 px-4 text-xl font-bold animate-pulse">
						Searching...
					</div>
				{:else if search.filteredItems.length === 0}
					<div class="flex items-center w-full h-20 px-4 text-xl font-bold">
						{noItemsFoundMessage}
					</div>
				{:else}
					{#each search.filteredItems as item (`${item.id}-dropdown-item`)}
						{const { name, id } = $derived(item)}
						{const url = $derived('url' in item ? item.url : undefined)}
						{@render dropdownItem({ name, id, url })}
					{/each}
				{/if}
			</form>
		{/if}
	</div>
</div>
