<script lang="ts">
	import EventActions from '$lib/components/EventActions.svelte';
	import { getRelaysById } from '$lib/nostr/nostrSubscriptions';
	import { publishEvent } from '$lib/nostr/publish';
	import { queryClient } from '$lib/utils/stores.svelte';
	import { t } from '@konemono/svelte5-i18n';
	import { X } from '@lucide/svelte';
	import { Dialog } from 'bits-ui';
	import { type Event as NostrEvent } from 'nostr-typedef';
	import { untrack } from 'svelte';

	interface Props {
		tag: string[];
		event: NostrEvent | null;
		isOpen?: boolean;
		editable?: boolean;
		setRelayHint?: (relay: string) => void;
		bloadcast?: (event: NostrEvent) => void;
	}
	let {
		event,
		isOpen = $bindable(false),
		tag,
		setRelayHint,
		editable = false,
		bloadcast
	}: Props = $props();
	const bloadcastEvent = async (ev: NostrEvent) => {
		await publishEvent(ev, $t('common.bloadcast'));
		/* 	const client = queryClient.get();
		if (!client) return;
		client.refetchQueries({ queryKey: [tag[1]] }); */
		bloadcast?.(ev);
		isOpen = false;
	};
	let formattedJson = $derived(formatEvent(event));
	function formatEvent(ev: NostrEvent | null): string | null {
		if (!ev) return null;
		try {
			return JSON.stringify(event, null, 2);
		} catch (error) {
			return null;
		}
	}
	let seenOnRelays: string[] = $state([]);
	$effect(() => {
		if (isOpen && event) {
			untrack(() => {
				//開くごとに更新
				seenOnRelays = getRelaysById(event.id);
			});
		}
	});
	//$inspect(isOpen);
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
		/>
		<Dialog.Content
			class="rounded-card-lg shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border bg-neutral-50 p-5 outline-hidden sm:max-w-[600px] md:w-full dark:bg-neutral-950"
		>
			<Dialog.Title
				class="flex w-full items-center justify-center text-lg font-semibold tracking-tight"
			>
				JSON DATA
			</Dialog.Title>
			<div
				class="mt-4 max-h-[70vh] overflow-auto rounded-lg bg-neutral-100 p-4 dark:bg-neutral-900"
			>
				<pre class="text-sm break-words whitespace-pre-wrap"><code>{JSON.stringify(tag)}</code
					></pre>
			</div>
			<!-- イベントのJSON内容を表示する部分 -->
			{#if formattedJson}
				<div
					class="mt-4 max-h-[30vh] overflow-auto rounded-lg bg-neutral-100 p-4 dark:bg-neutral-900"
				>
					<pre class="text-sm break-words whitespace-pre-wrap"><code>{formattedJson}</code></pre>
				</div>
			{:else}
				<div class="rounded-lg px-4 py-2 text-center shadow-md">イベントが見つかりませんでした</div>
			{/if}
			<EventActions {event} {seenOnRelays} {bloadcastEvent} {setRelayHint} {editable} />

			<Dialog.Close
				class="focus-visible:ring-foreground focus-visible:ring-offset-background absolute top-5 right-5 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-[0.98]"
			>
				<div>
					<X class="text-foreground size-5" />
					<span class="sr-only">Close</span>
				</div>
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
