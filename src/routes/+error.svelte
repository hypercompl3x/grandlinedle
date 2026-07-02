<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Grandlinedle - Error</title>
</svelte:head>

<h1 class="text-4xl font-bold text-center text-white text-shadow-sm text-shadow-black max-w-3xl">
	{page.error?.message}
</h1>
