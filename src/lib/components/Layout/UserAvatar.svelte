<script lang="ts">
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

	$effect(() => {
		if (loadingStatus === 'error') {
			handleStateError();
		}
	});
</script>

<div
	{title}
	class="relative flex items-center justify-center {!square
		? 'rounded-full'
		: ''} overflow-hidden bg-neutral-800"
	style="height: {size}px; width: {size}px;"
>
	{#if url && url !== ''}
		<img
			src={url}
			onload={() => (loadingStatus = 'loaded')}
			onerror={() => (loadingStatus = 'error')}
			alt={name}
			class="t-0 l-0 absolute object-cover {!square ? 'rounded-full' : ''}"
			style="height: 100%; width: 100%; object-fit: cover; object-position: center;"
			loading="lazy"
		/>
		{#if loadingStatus === 'error' || loadingStatus === 'loading'}
			<span class="t-0 l-0 absolute overflow-hidden"> {name}</span>{/if}
	{:else}
		<span class="t-0 l-0 absolute overflow-hidden"> {name}</span>
	{/if}
</div>
