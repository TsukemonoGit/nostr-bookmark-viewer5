<script lang="ts">
	import { useReq } from '$lib/nostr/nostrSubscriptions';
	import type { CreateQueryResult } from '@tanstack/svelte-query';
	import type Nostr from 'nostr-typedef';
	import type { EventPacket } from 'rx-nostr';
	import { untrack, type Snippet } from 'svelte';

	interface Props {
		relays?: string[] | undefined;
		id: string;
		error?: Snippet<[Error]>;
		nodata?: Snippet;
		loading?: Snippet;
		content?: Snippet<[{ event: Nostr.Event }]>;
		onChange?: (data: Nostr.Event) => void;
		onNodata?: () => void;
	}

	let { relays, id, error, loading, nodata, content, onChange, onNodata }: Props = $props();

	let queryKey = $derived([id]);
	let filters = $derived([{ ids: [id], limit: 1 }]);
	let max3relays = $derived(relays?.slice(0, 3));

	// useReq は unique を内部で持つため渡さない
	let result: CreateQueryResult<EventPacket | null, Error> = $derived(
		useReq(queryKey, filters, undefined, max3relays)
	);
	let data: EventPacket | null | undefined = $derived($result?.data);

	// onChange呼び出し
	$effect(() => {
		if (data) {
			untrack(() => {
				onChange?.(data.event);
			});
		}
	});

	// onNodata呼び出し
	$effect(() => {
		if (!$result.isPending && !$result.isError && !data) {
			untrack(() => {
				onNodata?.();
			});
		}
	});
</script>

{#if $result.isPending}
	{@render loading?.()}
{:else if $result.isError}
	{@render error?.($result.error)}
{:else if data}
	{@render content?.({ event: data.event })}
{:else}
	{@render nodata?.()}
{/if}
