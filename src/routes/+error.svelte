<script lang="ts">
	import { page } from '$app/state';
</script>

<h1 class="text-4xl font-bold text-center text-white text-shadow-sm text-shadow-black">
	{page.status}: {page.error?.message}
</h1>
