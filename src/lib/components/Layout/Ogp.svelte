<script lang="ts">
	import { type Ogp, useOgp } from '$lib/utils/ogp';
	import type { Snippet } from 'svelte';

	interface Props {
		url: string;
		renderContent?: Snippet<[Ogp]>;
		nodata?: Snippet;
	}

	let { url, renderContent, nodata }: Props = $props();

	let ogp = $derived(useOgp(url));
	let data = $derived(ogp.data);
</script>

{#if $data && renderContent}
	{@render renderContent($data)}
{:else}
	{@render nodata?.()}
{/if}
