<script lang="ts">
	import { cn } from '$lib/utils/helpers';
	import type { Character, CharacterWithImage } from '$lib/types/DatabaseTypes';

	type Props = {
		name: Character['name'];
		url: CharacterWithImage['url'];
		title: string;
		variant: 'incorrectGuess' | 'guess' | 'roundCharacter';
	};

	let { name, title, url, variant }: Props = $props();
</script>

<div
	class={cn('w-full rounded-lg border-2 border-black/15 p-4 text-center shadow-sm', {
		'bg-green-light': variant === 'roundCharacter',
		'bg-red-light': variant === 'incorrectGuess',
		'bg-grey': variant === 'guess',
	})}
>
	<p class="text-xs font-black uppercase tracking-[0.15em] text-white">
		{title}
	</p>
	<div class="mt-3 flex flex-col items-center">
		<img src={url} alt={name} class="w-28 rounded-lg shadow-md" />

		<p class="mt-2 text-2xl font-black text-white">
			{name}
		</p>
	</div>
</div>
