<!-- メインコンポーネント -->
<script lang="ts">
	import Link from './Link.svelte';
	import Ogp from './Ogp.svelte';
	import OgpCard from './OgpCard.svelte';

	let { url } = $props();
	let error = $state(false);

	const onError = () => {
		error = true;
	};
</script>

<Ogp url={url ?? ''}
	>{#snippet renderContent(contents)}
		{#if contents.title !== '' || contents.image !== '' || contents.description !== ''}
			<OgpCard {contents} url={url ?? ''} />
		{:else}
			<Link class=" link break-all text-primary-300 underline hover:opacity-80" href={url ?? ''}
				>{url ?? ''}</Link
			>
		{/if}
	{/snippet}

	{#snippet nodata()}
		<Link class=" link break-all text-primary-300 underline hover:opacity-80" href={url ?? ''}
			>{url ?? ''}</Link
		>
	{/snippet}
</Ogp>
