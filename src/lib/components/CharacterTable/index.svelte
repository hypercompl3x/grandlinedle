<script lang="ts">
	import type { Character, CharacterWithImage } from '$lib/types/DatabaseTypes';
	import { COLUMNS, HAKI_MAP, SAGA_MAP } from '$lib/utils/constants';
	import { cn, formatBounty, formatHeight } from '$lib/utils/helpers';
	import Cell from './Cell.svelte';
	import X from '$lib/assets/x.png';
	import Berry from '$lib/assets/berry.png';

	type Props = {
		guesses: CharacterWithImage[];
		currentCharacter: Character;
	};

	let { guesses, currentCharacter }: Props = $props();

	const getSagaIndex = (saga: string) => SAGA_MAP?.[saga] || 0;
</script>

<div class="w-full px-8 pb-8 lg:px-2">
	<div
		class="grid w-full overflow-x-auto grid-cols-[75px_75px_75px_75px_75px_75px_75px_75px_75px] text-base font-semibold leading-tight text-center text-white gap-x-2 gap-y-3"
	>
		{#each COLUMNS as col (`${col}-column`)}
			<div
				class="flex items-center justify-center p-1 text-sm font-bold text-black bg-white border border-black rounded-md"
			>
				{col}
			</div>
		{/each}
		{#each guesses as character, i (`${character.id}-guess`)}
			{@const noHakiMatches =
				currentCharacter.haki.length === 0
					? character.haki.length > 0
					: currentCharacter.haki.every(haki => !character.haki.includes(haki))}
			{@const someHakiMatches = currentCharacter.haki.some(haki => character.haki.includes(haki))}
			{@const allHakiMatches = currentCharacter.haki.every(haki => character.haki.includes(haki))}
			{@const sameNumberOfHaki = currentCharacter.haki.length === character.haki.length}

			{@const heightMatches =
				currentCharacter.height_cm === character.height_cm &&
				currentCharacter.height_m === character.height_m}
			{@const heightIsLarger =
				currentCharacter.height_m > character.height_m ||
				(currentCharacter.height_m === character.height_m &&
					currentCharacter.height_cm > character.height_cm)}

			<div class="relative overflow-hidden border border-black rounded-md group">
				<img src={character.url} alt={`${character.name} Image Guess`} />
				<div
					class={cn(
						'absolute top-0 flex items-center justify-center w-full h-full px-1 text-sm font-bold text-transparent transition-colors duration-200 group-hover:bg-blue-dark group-hover:text-white',
						{ 'text-xs': character.name.split(' ').some(word => word.length > 9) },
					)}
				>
					{character.name}
				</div>
			</div>
			<Cell id={`gender-${i}`} red={character.gender !== currentCharacter.gender}>
				{character.gender}
			</Cell>
			<Cell
				id={`affiliation-${i}`}
				red={character.affiliation !== currentCharacter.affiliation}
				class={{
					'text-sm': character.affiliation
						.split(' ')
						.some(word => word.length > 6 && word.length <= 9),
					'text-xs': character.affiliation
						.split(' ')
						.some(word => word.length > 9 && word.length <= 12),
					'text-[10px]': character.affiliation.split(' ').some(word => word.length > 12),
				}}
			>
				{character.affiliation}
			</Cell>
			<Cell
				id={`devil_fruit-${i}`}
				red={character.devil_fruit !== currentCharacter.devil_fruit}
				class={{ 'text-sm': character.devil_fruit === 'Paramecia' }}
			>
				{character.devil_fruit}
			</Cell>
			<Cell
				id={`haki-${i}`}
				red={noHakiMatches}
				yellow={someHakiMatches && (!allHakiMatches || !sameNumberOfHaki)}
				class="flex-wrap content-center"
			>
				{#if character.haki.length > 0}
					{#each character.haki as haki (`${haki}-${character.name}-haki`)}
						<img src={HAKI_MAP[haki]} alt={`${haki} ${character.name} Haki`} class="w-7" />
					{/each}
				{:else}
					<img src={X} alt="No Haki" class="w-7" />
				{/if}
			</Cell>
			<Cell
				id={`last_bounty-${i}`}
				red={character.last_bounty !== currentCharacter.last_bounty}
				arrow={currentCharacter.last_bounty > character.last_bounty ? 'up' : 'down'}
			>
				<div class="z-10 flex items-center gap-x-1">
					<img src={Berry} alt="Berry" />
					{formatBounty(character.last_bounty)}
				</div>
			</Cell>
			<Cell id={`height-${i}`} red={!heightMatches} arrow={heightIsLarger ? 'up' : 'down'}>
				<div class="z-10">
					{formatHeight(character.height_m, character.height_cm)}
				</div>
			</Cell>
			<Cell id={`origin-${i}`} red={character.origin !== currentCharacter.origin}>
				{character.origin}
			</Cell>
			<Cell
				id={`first_saga-${i}`}
				red={character.first_saga !== currentCharacter.first_saga}
				class={{ 'text-sm': character.first_saga === 'Dressrosa' }}
				arrow={getSagaIndex(currentCharacter.first_saga) > getSagaIndex(character.first_saga)
					? 'up'
					: 'down'}
			>
				<div class="z-10">
					{character.first_saga}
				</div>
			</Cell>
		{/each}
	</div>
</div>
