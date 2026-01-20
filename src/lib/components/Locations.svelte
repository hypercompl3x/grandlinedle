<script lang="ts">
	import type { LocationWithImage } from '$lib/types/DatabaseTypes';
	import { cn } from '$lib/utils/helpers';

	type Props = {
		currentLocation: LocationWithImage;
		guesses: LocationWithImage[];
	};

	let { currentLocation, guesses }: Props = $props();
</script>

<div class="px-4 pb-8 space-y-4">
	{#each guesses as location, i (`${location.id}-guess`)}
		<div
			id={`location-${i}`}
			class={cn(
				'p-4 leading-tight text-white border border-green-light rounded-md bg-green-primary flex max-sm:flex-col items-center gap-4',
				{
					'bg-red-light border-red-dark': location.id !== currentLocation.id,
				},
			)}
		>
			<img
				src={location.url}
				alt={location.name}
				class="w-40 border border-black rounded-md sm:w-52 grow-0"
			/>
			<div class="text-2xl font-bold text-center">
				{location.name}
			</div>
		</div>
	{/each}
</div>
