<script lang="ts">
	import Tabs from './_components/Tabs.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<Tabs />
{@render children()}
