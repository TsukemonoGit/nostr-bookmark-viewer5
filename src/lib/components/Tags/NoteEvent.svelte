<script lang="ts">
	import { encodetoNevent } from '$lib/utils/encode';

	import EmptyCard from '../EmptyCard.svelte';
	import Metadata from '../Nostr/Metadata.svelte';
	import Note from '../Nostr/Note.svelte';
	import NoteEventRenderer from '../Layout/NoteEventRenderer.svelte';
	import { type Event as NostrEvent } from 'nostr-typedef';
	import { queryClient } from '$lib/utils/stores.svelte';
	import SearchEvent from './SearchEvent.svelte';

	let { tag, setRelayHint, editable } = $props<{
		tag: string[];
		setRelayHint: (relay: string) => void;
		editable?: boolean;
	}>(); // ex: ["e", <hexid>, <relayURL>]

	// tagからIDとリレーURLを抽出
	let noteId = $derived(tag[1]);
	let relayUrl = $derived(tag[2] || undefined);
	let noteIdEncoded = $derived(
		encodetoNevent({
			id: noteId,
			...(relayUrl ? { relays: [relayUrl] } : {})
		})
	);

	// リレーURLの有効性チェック
	let validRelayUrl = $derived(relayUrl && relayUrl !== '' ? [relayUrl] : undefined);

	let view = $state(true);
	let retryWithRelay = $state(false);
</script>

<!-- NoteEventRenderer with Metadataのsnippet定義 -->
{#snippet noteWithMetadata(event: NostrEvent)}
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

{#if noteId && view}
	<Note
		id={noteId}
		{...retryWithRelay && validRelayUrl ? { relays: validRelayUrl } : {}}
		onNodata={() => {
			if (!retryWithRelay && validRelayUrl && validRelayUrl.length > 0) {
				queryClient.get()?.removeQueries({ queryKey: [noteId] });
				retryWithRelay = true;
			}
		}}
	>
		{#snippet loading()}
			<EmptyCard>Loading {noteIdEncoded}</EmptyCard>
		{/snippet}
		{#snippet nodata()}
			{#if !retryWithRelay}
				<EmptyCard>Retrying with relay...</EmptyCard>
			{:else}
				<SearchEvent {tag} {setRelayHint} {editable}>Nodata {noteIdEncoded}</SearchEvent>
			{/if}
		{/snippet}
		{#snippet content({ event })}
			{@render noteWithMetadata(event)}
		{/snippet}
	</Note>
{:else}
	<EmptyCard>Loading {noteIdEncoded}</EmptyCard>
{/if}
