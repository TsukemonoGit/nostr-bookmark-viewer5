<script lang="ts">
	import * as Nostr from 'nostr-typedef';
	import NoteLayout from './NoteLayout.svelte';
	import type { UserProfile } from '$lib/types/utiles';
	import { encodetoNpub } from '$lib/utils/encode';
	import { isAddressableKind, isReplaceableKind } from 'nostr-tools/kinds';
	import Replasable from './Replasable.svelte';
	import EngagementLayout from './EngagementLayout.svelte';
	import { repostedId } from '$lib/utils/util';
	import { Repeat } from '@lucide/svelte';
	import TagRenderer from '../Bookmark/TagRenderer.svelte';
	import Reaction from './Reaction.svelte';
	import UrlDisplay from './UrlDisplay.svelte';
	import { TokenType, type Token } from '@konemono/nostr-content-parser';
	import Kind9735 from './Kind9735.svelte';
	import Content from '../Content/Content.svelte';

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

	let warning: string[] | undefined = $derived(
		event?.tags.find((item) => item[0] === 'content-warning')
	);
</script>

{#if event.kind === 6 || event.kind === 7 || event.kind === 16}
	{@const engagementId = repostedId(event.tags)}
	<EngagementLayout
		reactionProfile={profile}
		created_at={event.created_at}
		tags={metadata?.tags || []}
	>
		{#snippet reactionMark()}
			{#if event.kind === 6 || event.kind === 16}
				<Repeat size="18px" color="blue" />
			{:else}
				<Reaction {event} />
			{/if}
		{/snippet}
		{#snippet originalNote()}<TagRenderer tag={engagementId.tag || []} />{/snippet}
	</EngagementLayout>
{:else if event.kind === 17}
	{@const reactionedUrl = event.tags.find((tag) => tag[0] === 'r')?.[1]}
	<EngagementLayout
		reactionProfile={profile}
		created_at={event.created_at}
		tags={metadata?.tags || []}
	>
		{#snippet reactionMark()}
			{#if event.kind === 6 || event.kind === 16}
				<Repeat size="18px" color="blue" />
			{:else}
				<Reaction {event} />
			{/if}
		{/snippet}
		{#snippet originalNote()}
			<UrlDisplay
				part={{
					type: TokenType.URL,
					content: reactionedUrl,
					start: 0,
					end: 0
				} as Token}
			/>
		{/snippet}
	</EngagementLayout>
{:else if event.kind === 9735}
	<Kind9735 {event} {profile} />
{:else}
	<NoteLayout
		{profile}
		created_at={event?.created_at}
		tags={metadata?.tags || []}
		warningText={warning !== undefined ? (warning.length > 1 ? warning[1] : '') : undefined}
	>
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
				<Content {event} />
				<!---->
			{/if}
		{/snippet}

		{#snippet error()}
			{#if error}
				<span>Error: {error}</span>
			{/if}
		{/snippet}
	</NoteLayout>{/if}
