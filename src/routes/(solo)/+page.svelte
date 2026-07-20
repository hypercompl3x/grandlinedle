<script lang="ts">
	import Links from './_components/Links.svelte';
</script>

<svelte:head>
	<title>Grandlinedle - Home</title>
	<meta
		name="description"
		content="Play Grandlinedle, a daily One Piece Wordle game featuring character, location, quote and crew challenges."
	/>
</svelte:head>

<main class="flex flex-col items-center w-full pb-12 max-sm:w-screen gap-y-8">
	<h1
		class="p-2 text-4xl font-bold text-center text-white rounded-md text-shadow-sm text-shadow-black"
	>
		Guess One Piece characters daily!
	</h1>
	<Links />
</main>
