<script lang="ts">
	import { useReq } from '$lib/nostr/nostrSubscriptions';
	import { parseNaddr } from '$lib/utils/util';
	import type { QueryKey, CreateQueryResult } from '@tanstack/svelte-query';
	import type Nostr from 'nostr-typedef';
	import { untrack, type Snippet } from 'svelte';
	import { pipe } from 'rxjs';
	import { latest, type EventPacket } from 'rx-nostr';

	interface Props {
		relays?: string[];
		id: string; //<kind:pubkey:identifier>
		error?: Snippet<[Error]>;
		nodata?: Snippet;
		loading?: Snippet;
		content?: Snippet<[{ event: Nostr.Event }]>;
		onChange?: (data: Nostr.Event) => void;
		onNodata?: () => void;
	}

	let {
		relays = undefined,
		id,
		error,
		loading,
		nodata,
		content,
		onChange,
		onNodata
	}: Props = $props();

	// naddrを解析
	let naddrAdress = $derived(parseNaddr(['a', id]));
	let queryKey: QueryKey = $derived([id]);
	let filters = $derived([
		{
			kinds: [naddrAdress.kind],
			authors: [naddrAdress.pubkey],
			'#d': [naddrAdress.identifier],
			limit: 1
		}
	]);

	let max3relays = $derived(relays?.slice(0, 3));

	// CreateQueryResultを直接取得
	let result: CreateQueryResult<EventPacket | null, Error> = $derived(
		useReq(queryKey, filters, pipe(latest()), max3relays) as CreateQueryResult<
			EventPacket | null,
			Error
		>
	);

	// onChange呼び出し（最新イベントIDの重複防止付き）
	let lastEventId = $state<string | undefined>(undefined);

	$effect(() => {
		if ($result?.data && 'event' in $result.data) {
			const event = $result.data.event;
			if (event.id !== lastEventId) {
				lastEventId = event.id;
				untrack(() => {
					onChange?.(event);
				});
			}
		}
	});

	// onNodata呼び出し
	$effect(() => {
		if (!$result.isPending && !$result.isError && (!$result.data || !('event' in $result.data))) {
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
{:else if $result.data && 'event' in $result.data}
	{@render content?.({ event: $result.data.event })}
{:else}
	{@render nodata?.()}
{/if}
