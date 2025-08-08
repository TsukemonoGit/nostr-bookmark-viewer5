<script lang="ts">
	interface Props {
		children?: any;
	}
	let { children }: Props = $props();
</script>

<div
	class={'my-1 grid w-full animate-pulse grid-cols-[auto_1fr] justify-start gap-1 overflow-hidden px-1 pt-0.5'}
>
	<!--icon-->
	<div class="h-10 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>

	<div class="max-w-full overflow-hidden pt-1">
		<!--name-->
		<div
			class="flex h-4 w-24 max-w-full flex-wrap items-center overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-700"
		></div>

		<!--text-->
		{#if children}
			<div class="break-all text-neutral-500 italic">
				{@render children()}
			</div>
		{:else}
			<div
				class="mt-1 flex h-10 w-full flex-wrap items-center overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-700"
			></div>{/if}
	</div>
</div>
