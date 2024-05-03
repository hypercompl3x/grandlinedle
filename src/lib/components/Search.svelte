<script lang="ts">
	import { Search } from 'lucide-svelte';
</script>

<div class="w-96 bg-black p-3 rounded-md flex gap-x-4 items-center bg-opacity-25">
	<input
		type="text"
		placeholder="Search for a character..."
		class="flex w-full rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
	/>
	<button type="button" class="group">
		<Search
			class="size-8 shrink-0 stroke-[2.5px] text-blue-dark group-hover:text-red transition-colors duration-300"
		/>
	</button>
</div>
