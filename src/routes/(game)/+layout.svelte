<script lang="ts">
	import type { LayoutProps } from './$types';
	import Tabs from '$lib/components/Tabs.svelte';

	let { children }: LayoutProps = $props();
</script>

<Tabs isHomePage={false} />
{@render children()}
