<script lang="ts">
	import { untrack } from 'svelte';

	interface Props {
		url: string | undefined;
		name: string | undefined;

		size?: number;
		square?: boolean;
		title?: string;
		handleStateError?: any;
	}

	let {
		url,
		name,

		size = 40,
		square = false,
		title = '',
		handleStateError = () => {}
	}: Props = $props();

	let loadingStatus: 'loading' | 'error' | 'loaded' = $state('loading');

	// urlが変更された時にloadingStatusをリセット
	$effect(() => {
		url;

		untrack(() => {
			loadingStatus = 'loading';
		});
	});

	$effect(() => {
		if (loadingStatus === 'error') {
			untrack(() => {
				handleStateError();
			});
		}
	});
</script>

<div
	{title}
	class="relative flex items-center justify-center overflow-hidden bg-neutral-300 dark:bg-neutral-700"
	style="height: {size}px; width: {size}px;"
>
	{#if url && url !== '' && loadingStatus !== 'error'}
		<img
			src={url}
			onload={() => (loadingStatus = 'loaded')}
			onerror={() => (loadingStatus = 'error')}
			alt={name}
			class="absolute top-0 left-0 object-cover"
			style="height: 100%; width: 100%; object-fit: cover; object-position: center;"
			loading="lazy"
		/>
		{#if loadingStatus === 'loading'}
			<div class="flex h-full w-full items-center justify-center text-center">
				{name}
			</div>
		{/if}
	{:else}
		<div
			class="flex h-full w-full items-center justify-center text-center text-xs text-neutral-500 dark:text-neutral-500"
		>
			{name}
		</div>
	{/if}
</div>
