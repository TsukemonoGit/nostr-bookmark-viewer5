<script lang="ts">
	import { TriangleAlert } from '@lucide/svelte';
	import { Slider } from 'bits-ui';
	import cn from 'clsx';
	interface Props {
		text: string;
	}

	let { text }: Props = $props();
	let value = $state(0);
</script>

<div
	class={cn(
		'absolute top-0 left-0 h-full w-full rounded-md border border-warning-500/40',
		value >= 50 && 'pointer-events-none'
	)}
	style="backdrop-filter: blur({(1 - value / 100) ** 2 * 30}px); -webkit-backdrop-filter: blur({(1 -
		value / 100) **
		2 *
		30}px);"
>
	<!-- 上部 WARNING バー -->
	<div
		class="absolute top-0 flex w-full items-center justify-center gap-1 text-xs font-bold text-warning-500"
		style="opacity:{1 - value / 100}; text-shadow: 0.5px 0.5px 1px rgb(0 0 0)"
	>
		<TriangleAlert size="16" />WARNING<TriangleAlert size="16" />
	</div>

	<!-- スクロール可能テキスト領域 -->
	<div
		class="text-warning-content absolute top-1/2 left-1/2 max-h-[calc(100%-24px)] w-full -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-1 text-center text-sm"
		style="opacity:{1 - value / 100}; text-shadow: 0.5px 0.5px 1px rgb(0 0 0)"
	>
		{text ?? ''}
	</div>
</div>

<!-- スライダー -->
<div class="relative bottom-0 flex h-7 w-full overflow-y-hidden px-1 text-center">
	<Slider.Root
		type="single"
		bind:value
		class="relative flex w-full touch-none items-center select-none"
	>
		<span
			class="relative h-1 w-full grow cursor-pointer overflow-hidden rounded-full bg-surface-200 dark:bg-surface-800"
		>
			<Slider.Range class="absolute h-full bg-surface-500 dark:bg-surface-700" />
		</span>
		<Slider.Thumb
			index={0}
			class={cn(
				'focus-visible:ring-foreground dark:shadow-card block size-[20px] cursor-pointer rounded-full border border-surface-500 bg-surface-300 shadow-sm transition-colors hover:border-surface-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-active:scale-[0.98] data-active:border-surface-400 dark:bg-surface-700'
			)}
		/>
	</Slider.Root>
</div>
