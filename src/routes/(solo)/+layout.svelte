<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import Results from './_components/Results.svelte';
	import Tabs from './_components/Tabs.svelte';
	import Footer from './_components/Footer/index.svelte';

	let { data, children }: LayoutProps = $props();
</script>

{#if data.completed}
	<Results {data} />
{/if}
{#if page.route.id !== '/(solo)'}
	<Tabs />
{/if}
{@render children()}
<Footer />
