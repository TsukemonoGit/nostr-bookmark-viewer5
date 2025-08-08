<!--ContentImage.svelte-->
<script lang="ts">
	import Link from './Link.svelte';

	let imgError: boolean = $state(false);
	let imgLoad: boolean = $state(false);
	interface Props {
		url: string;
	}

	let { url }: Props = $props();
</script>

{#if !imgError}
	{#if !imgLoad}<Link class=" link break-all text-primary-300 underline hover:opacity-80" href={url}
			>{url}</Link
		>{/if}
	<div>
		<img
			loading="lazy"
			width="288"
			height="200"
			alt="img"
			src={url}
			class=" max-h-[18rem] max-w-[min(18rem,100%)] overflow-hidden object-contain"
			onload={() => (imgLoad = true)}
			onerror={() => (imgError = true)}
		/>
	</div>{:else if imgError}
	<Link class=" link break-all text-primary-300 underline hover:opacity-80" href={url ?? ''}
		>{url}</Link
	>{/if}
