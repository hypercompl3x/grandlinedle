<script lang="ts">
	import { ScrollText } from 'lucide-svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { cn } from '$lib/utils/helpers';

	type PatchNote = {
		date: string;
		parts: { text: string; type?: 'character' | 'updated_value' }[];
	};

	const PATCH_NOTES: PatchNote[] = [
		{
			date: '29/06/26',
			parts: [
				{ text: 'Camie', type: 'character' },
				{ text: ' is now from ' },
				{ text: 'Summit War', type: 'updated_value' },
				{
					text: " (formerly Alabasta). The cover pages are no longer taken into account for a character's first saga.",
				},
			],
		},
	];
</script>

{#snippet button(onClick: () => void)}
	<button type="button" onclick={onClick} class="h-fit group/patchnotes">
		<ScrollText
			size={40}
			class="text-grey group-hover/patchnotes:text-grey-dark transition-colors duration-500"
		/>
	</button>
{/snippet}

<Modal {button} headerClass="bg-grey" containerClass="gap-y-3" name="Patch Notes">
	{#each PATCH_NOTES as { date, parts }, i (`patch-note-${i}`)}
		<div>
			{#each parts as { text, type }, j (`patch-note-part-${i}-${j}`)}
				<span
					class={cn({
						'text-red-primary': type === 'updated_value',
						'text-blue-primary': type === 'character',
					})}
				>
					{text}
				</span>
			{/each}
			-
			<span class="font-semibold">{date}</span>
		</div>
		{#if i < PATCH_NOTES.length - 1}
			<div class="w-full h-px bg-grey"></div>
		{/if}
	{/each}
</Modal>
