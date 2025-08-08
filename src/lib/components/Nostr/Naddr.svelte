<script lang="ts">
	import { useReq, type ReqStatus } from '$lib/nostr/nostrSubscriptions';
	import { parseNaddr } from '$lib/utils/util';
	import type { QueryKey } from '@tanstack/svelte-query';
	import type Nostr from 'nostr-typedef';
	import { type Snippet } from 'svelte';
	import type { Readable } from 'svelte/store';
	import { pipe } from 'rxjs';
	import { latest, type EventPacket } from 'rx-nostr';

	interface Props {
		relays?: string[] | undefined;
		id: string; //<kind:pubkey:identifier>
		error?: Snippet<[Error]>;
		nodata?: Snippet;
		loading?: Snippet;
		content?: Snippet<[{ event: Nostr.Event }]>;
		onChange?: (data: Nostr.Event) => void;
	}

	let { relays = undefined, id, error, loading, nodata, content, onChange }: Props = $props();

	let naddrAdress = $derived(parseNaddr(['a', id]));
	let queryKey: QueryKey = $derived([id] as QueryKey);
	let filters = $derived([
		{
			kinds: [naddrAdress.kind],
			authors: [naddrAdress.pubkey],
			'#d': [naddrAdress.identifier],
			limit: 1
		}
	]);

	let max3relays = $derived(relays?.slice(0, 3));

	// useReqをリアクティブに呼び出し、結果を直接抽出
	let result: {
		data: Readable<EventPacket | null | undefined>;
		status: Readable<ReqStatus>;
		error: Readable<Error>;
	} = $derived(
		useReq(queryKey, filters, pipe(latest()), max3relays) as {
			data: Readable<EventPacket | null | undefined>;
			status: Readable<ReqStatus>;
			error: Readable<Error>;
		}
	);
	let data = $derived(result.data);
	let status = $derived(result.status);
	let errorData = $derived(result.error);

	// データが取得されたときにonChangeを呼び出す副作用
	$effect(() => {
		const event = $data?.event;
		if (event && onChange) {
			onChange(event);
		}
	});
</script>

{#if $status === 'loading' && !$data}
	{@render loading?.()}
{:else if $errorData}
	{@render error?.($errorData)}
{:else if $data?.event}
	{@render content?.({ event: $data.event })}
{:else}
	{@render nodata?.()}
{/if}
