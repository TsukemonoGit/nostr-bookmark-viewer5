<script lang="ts">
	import { encodetoNaddr } from '$lib/utils/encode';

	import EmptyCard from '../EmptyCard.svelte';
	import NoteEventRenderer from '../Layout/NoteEventRenderer.svelte';
	import Metadata from '../Nostr/Metadata.svelte';
	import Naddr from '../Nostr/Naddr.svelte';
	import { type Event as NostrEvent } from 'nostr-typedef';

	let { tag }: { tag: string[] } = $props(); //ex. ["a",<kind:pubkey:identifier>,<relayURL>]

	// tagからIDとリレーURLを抽出
	let naddrId = $derived(tag[1]);
	let relayUrl = $derived(tag[2] || undefined);
	let naddrAdress = $derived(encodetoNaddr(naddrId));

	// リレーURLの有効性チェック
	let validRelayUrl = $derived(relayUrl && relayUrl !== '' ? [relayUrl] : undefined);
</script>

<!-- NoteEventRenderer with Metadataのsnippet定義 -->
{#snippet eventWithMetadata(event: NostrEvent)}
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

{#if naddrId}
	<Naddr id={naddrId}>
		{#snippet loading()}
			<EmptyCard>Loading {naddrAdress}</EmptyCard>
		{/snippet}
		{#snippet nodata()}
			<!-- リレーURLが指定されている場合の再試行 -->
			<Naddr id={naddrId} relays={validRelayUrl}>
				{#snippet loading()}
					<EmptyCard>Loading {naddrAdress}</EmptyCard>
				{/snippet}
				{#snippet nodata()}
					<EmptyCard>Not Found {naddrAdress}</EmptyCard>
				{/snippet}
				{#snippet content({ event })}
					{@render eventWithMetadata(event)}
				{/snippet}
			</Naddr>
		{/snippet}
		{#snippet content({ event })}
			{@render eventWithMetadata(event)}
		{/snippet}
	</Naddr>
{:else}
	<EmptyCard>Loading {naddrAdress}</EmptyCard>
{/if}
