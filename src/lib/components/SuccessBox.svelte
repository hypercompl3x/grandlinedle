<script lang="ts" generics="T extends {url: string, name: string}">
	import { getMidnightGMT } from '$lib/utils/helpers';

	const SUCCESS_MAP = {
		character: {
			imgAlt: "Today's character",
			nextMessage: 'Next Character in',
		},
		location: {
			imgAlt: "Today's location",
			nextMessage: 'Next location in',
		},
	};

	type Props = {
		correctGuess: T;
		page: 'character' | 'location';
	};

	let { correctGuess, page }: Props = $props();

	const { imgAlt, nextMessage } = SUCCESS_MAP[page];

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

<div id="success-box" class="w-full px-4 pb-12 max-w-96" data-testid="success-box">
	<div
		class="p-4 space-y-5 leading-tight text-center text-white border border-black rounded-md bg-green-light"
	>
		<div class="text-3xl font-bold">Well Played!</div>
		<div class="flex items-center justify-center gap-4 max-sm:flex-col">
			<img src={correctGuess.url} alt={imgAlt} class="h-24 border border-black rounded-md" />
			<div>
				<div class="font-semibold">You Guessed</div>
				<div class="text-2xl font-bold">{correctGuess.name}</div>
			</div>
		</div>
		<div>
			<div class="text-lg font-semibold">
				{nextMessage}
			</div>
			<div class="text-4xl font-bold">{timeLeft}</div>
		</div>
	</div>
</div>
