<script lang="ts">
	import { cn } from '$lib/utils/helpers';

	type Props = {
		direction: 'up' | 'down';
	};

	let { direction }: Props = $props();
</script>

<svg
	class={cn('fill-red-dark', {
		'rotate-180': direction === 'down',
	})}
	viewBox="0 0 60.731 60.731"
	xml:space="preserve"
>
	<polygon
		points="30.366,0 0.625,29.735 17.998,29.735 18.003,60.731 42.733,60.729 42.733,29.735 60.107,29.735 		"
	/>
</svg>
