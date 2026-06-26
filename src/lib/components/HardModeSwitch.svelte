<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	type Props = {
		checked: boolean;
	};

	let { checked }: Props = $props();

	let updatingDifficulty = $state(false);
	let showTooltip = $state(false);

	const check = async () => {
		try {
			updatingDifficulty = true;
			await fetch('/api/difficulty', {
				method: 'POST',
			});
			await invalidateAll();
		} catch (error) {
			console.error(error);
		} finally {
			updatingDifficulty = false;
		}
	};
</script>

<div class="flex items-center justify-center gap-x-2">
	<div class="text-xl font-bold text-white text-shadow-xs text-shadow-black">Easy</div>
	<div class="relative flex items-center">
		<button
			type="button"
			role="switch"
			aria-label="Is hard mode"
			aria-checked={checked}
			class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none shadow-xs shadow-black {checked
				? 'bg-red-primary'
				: 'bg-green-primary'}"
			disabled={!checked || updatingDifficulty}
			onmouseenter={() => (showTooltip = true)}
			onmouseleave={() => (showTooltip = false)}
			onclick={() => {
				showTooltip = false;
				check();
			}}
		>
			<span
				class="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform {checked
					? 'translate-x-5.5'
					: 'translate-x-0.5'}"
			></span>
		</button>
		{#if showTooltip}
			<div
				id="tooltip-01"
				role="tooltip"
				class="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-background shadow-md animate-in fade-in-0 zoom-in-95 w-max whitespace-nowrap"
			>
				Once you switch to Easy, you will not be able to switch back to Hard today!
			</div>
		{/if}
	</div>
	<div class="text-xl font-bold text-white text-shadow-xs text-shadow-black">Hard</div>
</div>
