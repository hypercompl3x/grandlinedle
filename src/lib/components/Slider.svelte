<script lang="ts">
	import { Slider } from 'bits-ui';
	import cn from 'clsx';

	type Props = {
		slides: number[];
		slide: number;
		label: string;
	};

	let { slides, label, slide = $bindable() }: Props = $props();
</script>

<div class="w-full flex flex-col gap-y-1">
	<label for={label} class="text-lg font-medium text-left">{label}</label>
	<Slider.Root
		id={label}
		type="single"
		bind:value={slide}
		step={slides}
		class="relative flex w-full touch-none select-none items-center"
	>
		{#each slides as value, index (`${label}-slider-${index}`)}
			<Slider.TickLabel
				{index}
				position="bottom"
				class="text-grey data-selected:text-black mt-1 text-lg font-medium"
			>
				{value}
			</Slider.TickLabel>
		{/each}
		<span class="bg-white relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full">
			<Slider.Range class="bg-red-light absolute h-full" />
		</span>
		<Slider.Thumb
			index={0}
			class={cn(
				'bg-red-primary focus-visible:outline-hidden block size-6 cursor-pointer rounded-full shadow-sm transition-colors ring-0 disabled:pointer-events-none disabled:opacity-50',
			)}
		/>
	</Slider.Root>
</div>
