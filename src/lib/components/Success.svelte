<script lang="ts">
	import type { CharacterWithImage } from '$lib/types/DatabaseTypes';
	import { getMidnightGMT } from '$lib/utils/helpers';

	type Props = {
		character: CharacterWithImage;
	};

	let { character }: Props = $props();

	const getTimeLeft = () => {
		const now = new Date();
		const midnight = getMidnightGMT();
		const diff = midnight.getTime() - now.getTime();

		const hours = Math.floor(diff / 1000 / 60 / 60);
		const minutes = Math.floor((diff / 1000 / 60) % 60);
		const seconds = Math.floor((diff / 1000) % 60);

		return `${hours}h ${minutes}m ${seconds}s`;
	};

	let timeLeft = $state(getTimeLeft());

	$effect(() => {
		const intervalId = setInterval(() => {
			timeLeft = getTimeLeft();
		}, 1000);

		return () => {
			clearInterval(intervalId);
		};
	});
</script>

<div id="success" class="w-full px-4 pb-12 max-w-96">
	<div
		class="p-4 space-y-5 leading-tight text-center text-white border border-black rounded-md bg-green-light"
	>
		<div class="text-3xl font-bold">Well Played!</div>
		<div class="flex items-center justify-center gap-x-4">
			<img
				src={character.url}
				alt="Today's character"
				class="h-24 border border-black rounded-md"
			/>
			<div>
				<div class="font-semibold">You Guessed</div>
				<div class="text-2xl font-bold">{character.name}</div>
			</div>
		</div>
		<div>
			<div class="text-lg font-semibold">Next Character in</div>
			<div class="text-4xl font-bold">{timeLeft}</div>
		</div>
	</div>
</div>
