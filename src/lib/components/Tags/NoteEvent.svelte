<script lang="ts">
	import { encodetoNevent } from '$lib/utils/encode';

	import EmptyCard from '../EmptyCard.svelte';
	import Metadata from '../Nostr/Metadata.svelte';
	import Note from '../Nostr/Note.svelte';
	import NoteEventRenderer from '../Layout/NoteEventRenderer.svelte';

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
</script>

{#if noteId}
	<Note id={noteId} relays={relayUrl && relayUrl !== '' ? [relayUrl] : undefined}>
		{#snippet loading()}
			<EmptyCard>Loading {noteIdEncoded}</EmptyCard>
		{/snippet}
		{#snippet nodata()}
			<EmptyCard>Not Found {noteIdEncoded}</EmptyCard>
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
	</Note>
{:else}
	<EmptyCard>Loading {noteIdEncoded}</EmptyCard>
{/if}
