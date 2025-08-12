<script lang="ts">
	import { encodetoNaddr } from '$lib/utils/encode';
	import { queryClient } from '$lib/utils/stores.svelte';

	import EmptyCard from '../EmptyCard.svelte';
	import NoteEventRenderer from '../Layout/NoteEventRenderer.svelte';
	import Metadata from '../Nostr/Metadata.svelte';
	import Naddr from '../Nostr/Naddr.svelte';
	import { type Event as NostrEvent } from 'nostr-typedef';
	import SearchEvent from './SearchEvent.svelte';

	let {
		tag,
		setRelayHint,
		editable
	}: { tag: string[]; setRelayHint?: (relay: string) => void; editable?: boolean } = $props(); //ex. ["a",<kind:pubkey:identifier>,<relayURL>]

	// tagからIDとリレーURLを抽出
	let naddrId = $derived(tag[1]);
	let relayUrl = $derived(tag[2] || undefined);
	let naddrAdress = $derived(encodetoNaddr(naddrId));

	// リレーURLの有効性チェック
	let validRelayUrl = $derived(relayUrl && relayUrl !== '' ? [relayUrl] : undefined);
	let view = $state(true);
	let retryWithRelay = $state(false);
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

{#if naddrId && view}
	<Naddr
		id={naddrId}
		{...retryWithRelay && validRelayUrl ? { relays: validRelayUrl } : {}}
		onNodata={() => {
			if (!retryWithRelay && validRelayUrl && validRelayUrl.length > 0) {
				queryClient.get()?.removeQueries({ queryKey: [naddrId] });
				retryWithRelay = true;
			}
		}}
	>
		{#snippet loading()}
			<EmptyCard>Loading {naddrAdress}</EmptyCard>
		{/snippet}
		{#snippet nodata()}
			{#if !retryWithRelay}
				<EmptyCard>Retrying with relay...</EmptyCard>
			{:else}
				<SearchEvent {tag} {setRelayHint} {editable}>Nodata {naddrAdress}</SearchEvent>
			{/if}
		{/snippet}
		{#snippet content({ event })}
			{@render eventWithMetadata(event)}
		{/snippet}
	</Naddr>
{:else}
	<EmptyCard>Loading {naddrAdress}</EmptyCard>
{/if}
