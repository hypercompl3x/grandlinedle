<script lang="ts">
	import Search from '$lib/components/Search/index.svelte';
	import { cn, formatBounty, formatHeight } from '$lib/utils/helpers.js';
	import Conquerors from "$lib/assets/conqueror's.png";
	import Armament from '$lib/assets/armament.png';
	import Observation from '$lib/assets/observation.png';
	import X from '$lib/assets/x.png';
	import Berry from '$lib/assets/berry.png';
	import Arrow from '$lib/components/Arrow.svelte';

	const COLUMNS = [
		'Character',
		'Gender',
		'Affiliation',
		'Devil Fruit',
		'Haki',
		'Last Bounty',
		'Height',
		'Origin',
		'First Saga',
	];

	const HAKI_MAP: Record<string, string> = {
		"Conqueror's": Conquerors,
		Armament: Armament,
		Observation: Observation,
	};

	let { data } = $props();

	let currentCharacter = $derived(data.currentCharacter);
	let guessIds = $derived(data.guesses.map(guess => guess.id));

	// TODO: clean up this page
	// TODO: add arrows onto first saga COLUMNS
	// TODO: create a success component below with success message, timer till next character, timezone
	// TODO: have confetti when you get it correct
</script>

<main class="flex flex-col items-center w-full h-full max-sm:w-screen gap-y-8">
	<div class="p-2 text-4xl font-bold text-center text-white rounded-md bg-opacity-35 text-shadow-1">
		Guess today's One Piece character!
	</div>
	{#if !guessIds.includes(currentCharacter.id)}
		<Search {guessIds} />
	{/if}
	{#if data.guesses.length > 0}
		<div class="w-full px-8 lg:px-2">
			<div
				class="grid w-full overflow-x-auto grid-cols-[75px_75px_75px_75px_75px_75px_75px_75px_75px] pb-12 text-base font-semibold leading-tight text-center text-white gap-x-2 gap-y-3"
			>
				{#each COLUMNS as col (`${col}-column`)}
					<div
						class="flex items-center justify-center p-1 text-sm font-bold text-black bg-white border border-black rounded-md bg-opacity-95"
					>
						{col}
					</div>
				{/each}
				{#each data.guesses as character (`${character.id}-guess`)}
					<div class="relative overflow-hidden border border-black rounded-md group">
						<img src={character.url} alt={`${character.name} Image Guess`} />
						<div
							class="absolute top-0 flex items-center justify-center w-full h-full px-1 text-sm font-bold text-transparent transition-colors duration-200 group-hover:bg-blue-dark group-hover:text-white"
						>
							{character.name}
						</div>
					</div>
					<div
						class={cn(
							'flex items-center justify-center border border-green-light rounded-md bg-green-primary px-1',
							{
								'bg-red-light border-red-dark': character.gender !== currentCharacter.gender,
							},
						)}
					>
						{character.gender}
					</div>
					<div
						class={cn(
							'flex items-center justify-center border border-green-light rounded-md bg-green-primary px-1',
							{
								'bg-red-light border-red-dark':
									character.affiliation !== currentCharacter.affiliation,
								'text-xs': character.affiliation.split(' ').some(word => word.length > 8),
								'text-sm': character.affiliation === 'Automata',
							},
						)}
					>
						{character.affiliation}
					</div>
					<div
						class={cn(
							'flex items-center justify-center border rounded-md bg-green-primary border-green-light px-1',
							{
								'bg-red-light border-red-dark':
									character.devil_fruit !== currentCharacter.devil_fruit,
								'text-sm': character.devil_fruit === 'Paramecia',
							},
						)}
					>
						{character.devil_fruit}
					</div>
					<div
						class={cn('flex justify-center content-center border rounded-md px-1 flex-wrap', {
							'bg-red-light border-red-dark': currentCharacter.haki.every(
								haki => !character.haki.includes(haki),
							),
							'bg-yellow-primary border-yellow-dark': currentCharacter.haki.some(haki =>
								character.haki.includes(haki),
							),
							'bg-green-primary border-green-light':
								currentCharacter.haki.every(haki => character.haki.includes(haki)) &&
								character.haki.length === currentCharacter.haki.length,
						})}
					>
						{#if character.haki.length > 0}
							{#each character.haki as haki (`${haki}-${character.name}-haki`)}
								<img src={HAKI_MAP[haki]} alt={`${haki} ${character.name} Haki`} class="w-7" />
							{/each}
						{:else}
							<img src={X} alt="No Haki" class="w-7" />
						{/if}
					</div>
					<div
						class={cn(
							'flex justify-center border rounded-md bg-green-primary border-green-light px-1',
							{
								'bg-red-light border-red-dark relative':
									character.last_bounty !== currentCharacter.last_bounty,
							},
						)}
					>
						<div class="z-10 flex items-center gap-x-1">
							<img src={Berry} alt="Berry" />
							{formatBounty(character.last_bounty)}
						</div>
						{#if character.last_bounty !== currentCharacter.last_bounty}
							<div class="absolute inset-0 w-11/12 m-auto h-fit">
								<Arrow
									direction={currentCharacter.last_bounty > character.last_bounty ? 'up' : 'down'}
								/>
							</div>
						{/if}
					</div>
					<div
						class={cn(
							'flex items-center justify-center border rounded-md bg-green-primary border-green-light px-1 relative',
							{
								'bg-red-light border-red-dark':
									character.height_cm !== currentCharacter.height_cm ||
									character.height_m !== currentCharacter.height_m,
							},
						)}
					>
						<div class="z-10">
							{formatHeight(character.height_m, character.height_cm)}
						</div>
						{#if character.height_cm !== currentCharacter.height_cm || character.height_m !== currentCharacter.height_m}
							<div class="absolute inset-0 w-11/12 m-auto h-fit">
								<Arrow
									direction={currentCharacter.height_m > character.height_m ||
									(currentCharacter.height_m === character.height_m &&
										currentCharacter.height_cm > character.height_cm)
										? 'up'
										: 'down'}
								/>
							</div>
						{/if}
					</div>
					<div
						class={cn(
							'flex items-center justify-center border border-green-light rounded-md bg-green-primary px-1',
							{
								'bg-red-light border-red-dark': character.origin !== currentCharacter.origin,
							},
						)}
					>
						{character.origin}
					</div>
					<div
						class={cn(
							'flex items-center justify-center border border-green-light rounded-md bg-green-primary px-1',
							{
								'bg-red-light border-red-dark':
									character.first_saga !== currentCharacter.first_saga,
							},
						)}
					>
						{character.first_saga}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</main>
