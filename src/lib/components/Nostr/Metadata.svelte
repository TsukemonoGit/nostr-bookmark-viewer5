<script lang="ts">
	import { useReq, type ReqStatus } from '$lib/nostr/nostrSubscriptions';
	import type { QueryKey, CreateQueryResult } from '@tanstack/svelte-query';
	import type Nostr from 'nostr-typedef';
	import { latest, type EventPacket } from 'rx-nostr';
	import { untrack, type Snippet } from 'svelte';
	import { pipe } from 'rxjs';

	interface Props {
		relays?: string[] | undefined;
		pubkey: string;
		error?: Snippet<[Error]>;
		nodata?: Snippet;
		loading?: Snippet;
		content?: Snippet<[{ metadata: Nostr.Event }]>;
		onChange?: (data: Nostr.Event) => void;
	}

	let { relays = undefined, pubkey, error, loading, nodata, content, onChange }: Props = $props();

	let queryKey = $derived([`0:${pubkey}:`] as const);
	let filters = $derived([{ kinds: [0], authors: [pubkey], limit: 1 }]);
	let max3relays = $derived(relays?.slice(0, 3));

	let result: CreateQueryResult<EventPacket | null, Error> = $derived(
		useReq(queryKey, filters, pipe(latest()), max3relays) as CreateQueryResult<
			EventPacket | null,
			Error
		>
	);

	$effect(() => {
		const event = $result?.data?.event;
		if (event && onChange) {
			untrack(() => {
				onChange(event);
			});
		}
	});
</script>

{#if $result.isPending && !$result.data}
	{@render loading?.()}
{:else if $result.isError}
	{@render error?.($result.error)}
{:else if $result.data && $result.data.event}
	{@render content?.({ metadata: $result.data.event })}
{:else}
	{@render nodata?.()}
{/if}
