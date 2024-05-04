<script lang="ts">
	import type { FormEventHandler } from 'svelte/elements';
	import { applyAction, enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Search } from 'lucide-svelte';
	import { getCharactersFromQuery } from '$lib/services/characterService';
	import type { CharacterWithImage } from '$lib/types/DatabaseTypes';
	import asyncTransition from '$lib/utils/asyncTransition.svelte';
	import { invalidateAll } from '$app/navigation';

	type DropdownItem = {
		name: CharacterWithImage['name'];
		url: CharacterWithImage['url'];
		id: CharacterWithImage['id'];
	};

	type Props = {
		guessIds: CharacterWithImage['id'][];
	};

	let { guessIds }: Props = $props();

	const transition = asyncTransition();

	let containerEl = $state<HTMLDivElement>();
	let isDropdownOpen = $state(false);
	let query = $state('');
	let characters = $state<CharacterWithImage[]>([]);
	let filteredCharacters = $state<CharacterWithImage[]>([]);

	let currentSearchPromise = Promise.resolve();

	const handleClick = (e: Event) => {
		if (containerEl && !containerEl.contains(e?.target as Node)) {
			isDropdownOpen = false;
		}
	};

	const updateAllCharacters = (newCharacters: CharacterWithImage[]) => {
		characters = newCharacters;
		filteredCharacters = newCharacters;
	};

	const handleSearch: FormEventHandler<HTMLInputElement> = async e => {
		await currentSearchPromise;

		const oldQuery = query;
		const { value } = e.currentTarget;

		isDropdownOpen = true;
		query = value;

		if (!query) {
			updateAllCharacters([]);
			return;
		}

		if (oldQuery[0] === value[0]) {
			filteredCharacters = characters.filter(character =>
				character.name.toLowerCase().includes(value.toLowerCase()),
			);
			return;
		}

		currentSearchPromise = transition.startTransition(async () => {
			const newCharacters = await getCharactersFromQuery(query, guessIds);
			updateAllCharacters(newCharacters);
		});
	};

	const pickCharacter: SubmitFunction = () => {
		return async ({ result }) => {
			updateAllCharacters([]);
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

{#snippet dropdownItem({id, name, url}: DropdownItem)}
	<button
		name="characterId"
		type="submit"
		value={id}
		class="flex items-center w-full px-4 py-2 text-xl font-bold hover:bg-white gap-x-5 focus-visible:outline-none focus:bg-white"
	>
		<img src={url} alt={`${name} Image`} class="h-16 rounded-md" />
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
			placeholder="Search for a character..."
			class="flex w-full py-2 pl-3 pr-10 text-sm border border-black rounded-md focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
		/>
		<Search size={20} class="absolute inset-y-0 my-auto right-3" />
		{#if isDropdownOpen && query}
			<form
				use:enhance={pickCharacter}
				method="POST"
				class="absolute top-[38px] bg-white bg-opacity-95 inset-x-0 mx-auto rounded-md overflow-hidden max-h-80 overflow-y-auto z-20"
			>
				{#if transition.isPending}
					<div class="flex items-center w-full h-20 px-4 text-xl font-bold animate-pulse">
						Searching...
					</div>
				{:else if filteredCharacters.length === 0}
					<div class="flex items-center w-full h-20 px-4 text-xl font-bold">
						No characters found
					</div>
				{:else}
					{#each filteredCharacters as character (`${character.id}-dropdown-item`)}
						{@const { name, url, id } = character}
						{@render dropdownItem({ name, url, id })}
					{/each}
				{/if}
			</form>
		{/if}
	</div>
</div>
