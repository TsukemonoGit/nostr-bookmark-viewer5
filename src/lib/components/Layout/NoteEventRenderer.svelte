<script lang="ts">
	import * as Nostr from 'nostr-typedef';
	import NoteLayout from './NoteLayout.svelte';
	import type { UserProfile } from '$lib/types/utiles';
	import { encodetoNpub } from '$lib/utils/encode';
	import Content from './Content.svelte';
	import { isAddressableKind, isReplaceableKind } from 'nostr-tools/kinds';
	import Replasable from './Replasable.svelte';

	interface Props {
		event: Nostr.Event;
		metadata?: Nostr.Event | undefined;
	}

	let { event, metadata }: Props = $props();
	let profile: UserProfile | undefined = $derived.by(() => {
		if (!metadata) return undefined;
		try {
			return JSON.parse(metadata.content);
		} catch (e) {
			return undefined;
		}
	});
</script>

<NoteLayout {profile} created_at={event?.created_at}>
	{#snippet replyUser()}
		{@const replyUserList = event.tags
			.filter((tag) => tag[0] === 'p' && typeof tag[1] === 'string')
			.map((tag) => tag[1])}
		{#each replyUserList as user}
			{@const npub = encodetoNpub(user)}
		{/each}
	{/snippet}

	{#snippet content()}
		{#if event.kind === 1 || event.kind === 42}
			<Content {event} />
		{:else if isReplaceableKind(event.kind) || isAddressableKind(event.kind)}
			<Replasable {event} />
		{:else}
			<!---->
		{/if}
	{/snippet}

	{#snippet error()}
		{#if error}
			<span>Error: {error}</span>
		{/if}
	{/snippet}
</NoteLayout>
