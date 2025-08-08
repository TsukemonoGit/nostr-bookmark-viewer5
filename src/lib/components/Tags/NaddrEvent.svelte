<script lang="ts">
	import { encodetoNaddr } from '$lib/utils/encode';
	import { viewport } from '$lib/utils/useViewportAction';

	import EmptyCard from '../EmptyCard.svelte';
	import NoteEventRenderer from '../Layout/NoteEventRenderer.svelte';
	import Metadata from '../Nostr/Metadata.svelte';

	import Naddr from '../Nostr/Naddr.svelte';

	let { tag }: { tag: string[] } = $props(); //ex. ["a",<kind:pubkey:identifier>,<relayURL>]

	let hasLoaded = $state(false);

	// tagからIDとリレーURLを抽出
	let naddrId = $derived(tag[1]);
	let relayUrl = $derived(tag[2] || undefined);
	let naddrAdress = $derived(encodetoNaddr(naddrId));

	const handleEnterViewport = () => {
		//console.log('in,', noteId);
		if (!hasLoaded) {
			hasLoaded = true;
		}
	};
</script>

{#if naddrId}
	<div use:viewport={null} onenterViewport={handleEnterViewport}>
		{#if hasLoaded}
			<Naddr id={naddrId} relays={relayUrl && relayUrl !== '' ? [relayUrl] : undefined}>
				{#snippet loading()}
					<EmptyCard>Loading {naddrAdress}</EmptyCard>
				{/snippet}
				{#snippet nodata()}
					<EmptyCard>Not Found {naddrAdress}</EmptyCard>
				{/snippet}
				{#snippet content({ event })}
					<Metadata pubkey={event.pubkey}>
						{#snippet loading()}
							<NoteEventRenderer {event} />
						{/snippet}
						{#snippet nodata()}
							<NoteEventRenderer {event} />
						{/snippet}
						{#snippet content({ metadata })}
							<NoteEventRenderer {event} {metadata} />
						{/snippet}
					</Metadata>
				{/snippet}
			</Naddr>
		{:else}
			<EmptyCard>Loading {naddrAdress}</EmptyCard>
		{/if}
	</div>
{:else}
	<EmptyCard>Loading {naddrAdress}</EmptyCard>
{/if}
