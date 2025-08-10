<script lang="ts">
	import { encodetoNevent } from '$lib/utils/encode';

	import EmptyCard from '../EmptyCard.svelte';
	import Metadata from '../Nostr/Metadata.svelte';
	import Note from '../Nostr/Note.svelte';
	import NoteEventRenderer from '../Layout/NoteEventRenderer.svelte';
	import { type Event as NostrEvent } from 'nostr-typedef';

	let { tag } = $props<{ tag: string[] }>(); // ex: ["e", <hexid>, <relayURL>]

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

{#if noteId}
	<Note id={noteId}>
		{#snippet loading()}
			<EmptyCard>Loading {noteIdEncoded}</EmptyCard>
		{/snippet}
		{#snippet nodata()}
			<!-- リレーURLが指定されている場合の再試行 -->
			<Note id={noteId} relays={validRelayUrl}>
				{#snippet loading()}
					<EmptyCard>Loading {noteIdEncoded}</EmptyCard>
				{/snippet}
				{#snippet nodata()}
					<EmptyCard>Not Found {noteIdEncoded}</EmptyCard>
				{/snippet}
				{#snippet content({ event })}
					{@render noteWithMetadata(event)}
				{/snippet}
			</Note>
		{/snippet}
		{#snippet content({ event })}
			{@render noteWithMetadata(event)}
		{/snippet}
	</Note>
{:else}
	<EmptyCard>Loading {noteIdEncoded}</EmptyCard>
{/if}
