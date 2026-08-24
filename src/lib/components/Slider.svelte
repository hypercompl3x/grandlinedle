<script lang="ts">
	import { Slider } from 'bits-ui';
	import cn from 'clsx';

	type Props = {
		slides: number[];
		slide: number;
		label: string;
		disabled?: boolean;
		showSlides?: boolean;
	};

	let {
		slides,
		label,
		slide = $bindable(),
		showSlides = false,
		disabled = false,
	}: Props = $props();
</script>

<div class="w-full flex flex-col gap-y-1">
	<label for={label} class="text-lg font-medium text-left">{label}</label>
	<Slider.Root
		id={label}
		type="single"
		bind:value={slide}
		step={slides}
		{disabled}
		class="relative flex w-full touch-none select-none items-center"
	>
		{#if showSlides}
			{#each slides as value, index (`${label}-slider-${index}`)}
				<Slider.TickLabel
					{index}
					position="bottom"
					class="text-black/60 data-selected:text-black mt-1 text-lg font-medium"
				>
					{value}
				</Slider.TickLabel>
			{/each}
		{/if}
		<span class="bg-grey/20 relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full">
			<Slider.Range class="bg-red-primary absolute h-full" />
		</span>
		<Slider.Thumb
			index={0}
			class={cn(
				'bg-red-light focus-visible:outline-hidden block size-6 cursor-pointer rounded-full shadow-sm transition-colors ring-0 disabled:pointer-events-none disabled:opacity-50',
			)}
		/>
	</Slider.Root>
</div>
