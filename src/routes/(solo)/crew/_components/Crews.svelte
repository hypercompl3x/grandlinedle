<script lang="ts">
	import { cn } from '$lib/utils/helpers';
	import type { CrewWithImage } from '$lib/types/DatabaseTypes';

	type Props = {
		currentCrew: CrewWithImage;
		guesses: CrewWithImage[];
	};

	let { currentCrew, guesses }: Props = $props();
</script>

<div class="px-4 pb-8 space-y-4">
	{#each guesses as crew, i (`${crew.id}-guess`)}
		<div
			id={`crew-${i}`}
			class={cn(
				'p-4 leading-tight text-white rounded-md bg-green-primary flex max-sm:flex-col items-center gap-4',
				{
					'bg-red-light': crew.id !== currentCrew.id,
				},
			)}
		>
			<img src={crew.url} alt={crew.name} class="w-40 rounded-md sm:w-52 grow-0" />
			<div class="text-2xl font-bold text-center">
				{crew.name}
			</div>
		</div>
	{/each}
</div>
