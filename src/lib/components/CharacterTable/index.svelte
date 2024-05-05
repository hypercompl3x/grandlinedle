<script lang="ts">
	import type { Character, CharacterWithImage } from '$lib/types/DatabaseTypes';
	import { COLUMNS, HAKI_MAP } from '$lib/utils/constants';
	import { formatBounty, formatHeight } from '$lib/utils/helpers';
	import Cell from './Cell.svelte';

	import X from '$lib/assets/x.png';
	import Berry from '$lib/assets/berry.png';

	type Props = {
		guesses: CharacterWithImage[];
		currentCharacter: Character;
	};

	let { guesses, currentCharacter }: Props = $props();
</script>

{#if guesses.length > 0}
	<div class="w-full px-8 lg:px-2">
		<div
			class="grid w-full overflow-x-auto grid-cols-[75px_75px_75px_75px_75px_75px_75px_75px_75px] pb-12 text-base font-semibold leading-tight text-center text-white gap-x-2 gap-y-3"
		>
			{#each COLUMNS as col (`${col}-column`)}
				<div
					class="flex items-center justify-center p-1 text-sm font-bold text-black bg-white border border-black rounded-md"
				>
					{col}
				</div>
			{/each}
			{#each guesses as character (`${character.id}-guess`)}
				<div class="relative overflow-hidden border border-black rounded-md group">
					<img src={character.url} alt={`${character.name} Image Guess`} />
					<div
						class="absolute top-0 flex items-center justify-center w-full h-full px-1 text-sm font-bold text-transparent transition-colors duration-200 group-hover:bg-blue-dark group-hover:text-white"
					>
						{character.name}
					</div>
				</div>
				<Cell red={character.gender !== currentCharacter.gender}>
					{character.gender}
				</Cell>
				<Cell
					red={character.affiliation !== currentCharacter.affiliation}
					class={{
						'text-xs': character.affiliation.split(' ').some(word => word.length > 8),
						'text-sm': character.affiliation === 'Automata',
					}}
				>
					{character.affiliation}
				</Cell>
				<Cell
					red={character.devil_fruit !== currentCharacter.devil_fruit}
					class={{ 'text-sm': character.devil_fruit === 'Paramecia' }}
				>
					{character.devil_fruit}
				</Cell>
				<Cell
					red={currentCharacter.haki.every(haki => !character.haki.includes(haki))}
					yellow={currentCharacter.haki.some(haki => character.haki.includes(haki)) &&
						!currentCharacter.haki.every(haki => character.haki.includes(haki))}
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
					red={character.last_bounty !== currentCharacter.last_bounty}
					arrow={currentCharacter.last_bounty > character.last_bounty ? 'up' : 'down'}
				>
					<div class="z-10 flex items-center gap-x-1">
						<img src={Berry} alt="Berry" />
						{formatBounty(character.last_bounty)}
					</div>
				</Cell>
				<Cell
					red={character.height_cm !== currentCharacter.height_cm ||
						character.height_m !== currentCharacter.height_m}
					arrow={currentCharacter.height_m > character.height_m ||
					(currentCharacter.height_m === character.height_m &&
						currentCharacter.height_cm > character.height_cm)
						? 'up'
						: 'down'}
				>
					<div class="z-10">
						{formatHeight(character.height_m, character.height_cm)}
					</div>
				</Cell>
				<Cell red={character.origin !== currentCharacter.origin}>
					{character.origin}
				</Cell>
				<Cell red={character.first_saga !== currentCharacter.first_saga}>
					{character.first_saga}
				</Cell>
			{/each}
		</div>
	</div>
{/if}
