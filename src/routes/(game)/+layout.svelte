<script lang="ts">
	import Tabs from '$lib/components/Tabs.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<Tabs isHomePage={false} />
{@render children()}
