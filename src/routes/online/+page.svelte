<script lang="ts">
	import HostForm from './_components/HostForm.svelte';
	import JoinForm from './_components/JoinForm.svelte';

	// IF THE USER IS STILL LOGGED IN, ONLY SHOW A RECONNECT BUTTON OR PERMA LEAVE GAME
</script>

<svelte:head>
	<title>Grandlinedle - Online</title>
	<meta name="description" content="Play online against other players!" />
</svelte:head>

<main class="flex flex-col items-center w-full pb-12 max-sm:w-screen gap-y-8 px-2">
	<JoinForm />
	<div class="w-full h-px bg-grey"></div>
	<HostForm />
</main>
