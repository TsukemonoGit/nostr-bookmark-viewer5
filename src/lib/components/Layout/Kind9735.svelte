<script lang="ts">
	import * as Nostr from 'nostr-typedef';
	import Metadata from '../Nostr/Metadata.svelte';
	import { extractAmount, extractKind9734, extractZappedId } from '$lib/utils/zap';
	import EngagementLayout from './EngagementLayout.svelte';
	import type { UserProfile } from '$lib/types/utiles';
	import { Zap } from '@lucide/svelte';
	import TagRenderer from '../Bookmark/TagRenderer.svelte';

	interface Props {
		event: Nostr.Event;
		profile: UserProfile | undefined;
	}

	let { event, profile }: Props = $props();

	//kind9734の取得と検証
	let zapRequestEvent = $derived(extractKind9734(event));

	let amount: number | undefined = $derived(extractAmount(event, zapRequestEvent));

	let zappedUserProfile: UserProfile | undefined = $state(undefined);

	let zappedId: {
		tag: string[];
	} = $derived(extractZappedId(zapRequestEvent?.tags || []));

	function setZappedUser(e: Nostr.Event) {
		try {
			zappedUserProfile = JSON.parse(e.content);
		} catch (e) {}
	}
</script>

{#if zapRequestEvent}
	<Metadata pubkey={zapRequestEvent.pubkey} onChange={setZappedUser}></Metadata>
	<EngagementLayout
		reactionProfile={zappedUserProfile}
		created_at={event.created_at}
		tags={event?.tags || []}
	>
		{#snippet reactionMark()}
			<div class="text-sm">
				<Zap class={`stroke-secondary-600`} size={20} />
				{amount || ''}{zapRequestEvent.content}
			</div>
		{/snippet}
		{#snippet originalNote()}<TagRenderer tag={zappedId.tag || []} />{/snippet}
	</EngagementLayout>
{/if}
