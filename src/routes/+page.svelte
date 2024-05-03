<script lang="ts">
	import Search from '$lib/components/Search.svelte';

	let count = $state(0);
	let { data } = $props();

	$inspect(data);
</script>

<Search />
