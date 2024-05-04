<script lang="ts">
	import { page } from '$app/stores';
</script>

<h1 class="text-5xl font-bold text-center text-white text-shadow-1">
	{$page.error?.message}
</h1>
