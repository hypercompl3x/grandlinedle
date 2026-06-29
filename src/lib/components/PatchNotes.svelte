<script lang="ts">
	import { cn } from '$lib/utils/helpers';
	import { ScrollText, X } from 'lucide-svelte';

	type PatchNote = {
		date: string;
		parts: { text: string; type?: 'character' | 'updated_value' }[];
	};

	let dialog = $state<HTMLDialogElement>();

	const PATCH_NOTES: PatchNote[] = [
		{
			date: '29/06/26',
			parts: [
				{ text: 'Camie', type: 'character' },
				{ text: ' is now from ' },
				{ text: 'Sabaody Archipelago', type: 'updated_value' },
				{
					text: " (formerly Alabasta). The cover pages are no longer taken into account for a character's first arc.",
				},
			],
		},
	];
</script>

<button type="button" onclick={() => dialog?.showModal()} class="h-fit group/patchnotes"
	><ScrollText
		size={40}
		class="text-grey group-hover/patchnotes:text-grey-dark transition-colors duration-500"
	/></button
>

<dialog
	bind:this={dialog}
	class="w-[calc(100%-32px)] sm:w-full overflow-hidden rounded-md max-w-96 backdrop:bg-black backdrop:opacity-40 fixed inset-0 m-auto h-fit"
	onclick={e => {
		if (e.target === dialog) {
			dialog.close();
		}
	}}
>
	<div class="relative flex justify-center p-2 text-white bg-grey">
		<div class="text-xl font-semibold sm:text-3xl">Patch Notes</div>
		<button
			type="button"
			onclick={() => dialog?.close()}
			class="absolute inset-y-0 focus:ring-0 focus:outline-hidden right-2"
			><X class="stroke-2 sm:stroke-[3px] size-6 sm:size-8" /></button
		>
	</div>
	<div class="flex flex-col items-center text-lg p-2 gap-y-3">
		{#each PATCH_NOTES as { date, parts }, i (`patch-note-${i}`)}
			<div>
				{#each parts as { text, type }, j (`patch-note-part-${i}-${j}`)}
					<span
						class={cn({
							'text-red-primary': type === 'updated_value',
							'text-blue-primary': type === 'character',
						})}>{text}</span
					>
				{/each}
				- <span class="font-semibold">{date}</span>
			</div>
			{#if i < PATCH_NOTES.length - 1}
				<div class="w-full h-px bg-grey"></div>
			{/if}
		{/each}
	</div>
</dialog>
