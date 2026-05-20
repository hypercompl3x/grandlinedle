<script lang="ts">
	import { page } from '$app/state';
</script>

<h1 class="text-5xl font-bold text-center text-white text-shadow-1">
	{page.status}: {page.error?.message}
</h1>
