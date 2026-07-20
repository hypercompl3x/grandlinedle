<script lang="ts">
	import Support from './Support.svelte';
	import Feedback from './Feedback.svelte';
	import About from './About.svelte';
</script>

<footer class="mt-auto py-6 flex flex-col gap-y-1.5 items-center text-white">
	<div class="flex gap-x-3">
		<Support />
		<About />
		<Feedback />
	</div>
	<div class="text-shadow-xs text-shadow-black text-sm font-semibold">
		grandlinedle.com | {new Date().getFullYear()}
	</div>
</footer>
