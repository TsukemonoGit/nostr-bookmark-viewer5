<script lang="ts">
	import { hexRegex, nip33Regex } from '$lib/utils/regex';
	import { parseNaddr } from '$lib/utils/util';
	import { Search, X, LoaderCircle } from '@lucide/svelte';
	import { Dialog } from 'bits-ui';
	import type { Event, Filter } from 'nostr-typedef';
	import { eventSearchRelays } from '$lib/utils/constants';
	import NoteEventRenderer from '../Layout/NoteEventRenderer.svelte';
	import {
		getRelaysById,
		useRelayEventTracking,
		type RelayEventStatus,
		type OverallStatus
	} from '$lib/nostr/nostrSubscriptions';
	import { writable, type Writable } from 'svelte/store';
	import { onDestroy } from 'svelte';
	import Metadata from '../Nostr/Metadata.svelte';
	import { t } from '@konemono/svelte5-i18n';

	interface Props {
		tag: string[];
		children?: any;
		editable?: boolean;
		setRelayHint?: (relay: string) => void;
	}
	let { tag, children, setRelayHint, editable = false }: Props = $props();

	let isOpen = $state(false);
	let filter: Filter | null = $derived.by(() => {
		const id = tag[1];
		if (hexRegex.test(id)) {
			return { ids: [id], limit: 1 };
		} else if (nip33Regex.test(id)) {
			const address = parseNaddr(['a', id]);
			return {
				authors: [address.pubkey],
				kinds: [address.kind],
				...(address.identifier !== '' ? { '#d': [address.identifier] } : {})
			};
		} else {
			return null;
		}
	});

	let searchStatus: Writable<Record<string, RelayEventStatus> | null> = $state(writable(null));
	let foundEvent: Writable<Event | null> = $state(writable(null));
	let overallStatus: Writable<OverallStatus | null> = $state(writable(null));
	let cleanupFunction: (() => void) | null = null;
	let seenOnList: string[] = $state([]);

	const searchEvent = () => {
		if (filter) {
			if (cleanupFunction) {
				cleanupFunction();
			}

			overallStatus.set(null);
			foundEvent.set(null);
			seenOnList = [];

			const {
				relayEventStatus,
				overallStatus: newOverallStatus,
				event,
				cleanup
			} = useRelayEventTracking([filter], null, eventSearchRelays);
			searchStatus = relayEventStatus;
			foundEvent = event;
			overallStatus = newOverallStatus;
			cleanupFunction = cleanup;

			const eventUnsubscribe = foundEvent.subscribe((e) => {
				if (e) {
					seenOnList = getRelaysById(e.id);
				}
			});

			cleanupFunction = () => {
				cleanup();
				eventUnsubscribe();
			};
		}
	};

	onDestroy(() => {
		if (cleanupFunction) {
			cleanupFunction();
		}
	});

	$effect(() => {
		if (isOpen && !overallStatus) {
			searchEvent();
		}
	});
</script>

<div
	class={'my-1 grid w-full grid-cols-[auto_1fr] justify-start gap-1 overflow-hidden px-1 pt-0.5'}
>
	<div class="flex items-center">
		<button class="btn-icon rounded-full preset-filled-primary-500" onclick={() => (isOpen = true)}>
			<Search />
		</button>
	</div>

	<div class="max-w-full overflow-hidden pt-1">
		<div
			class="flex h-4 w-24 max-w-full flex-wrap items-center overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-700"
		></div>

		{#if children}
			<div class="break-all text-neutral-500 italic">
				{@render children()}
			</div>
		{:else}
			<div
				class="mt-1 flex h-10 w-full flex-wrap items-center overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-700"
			></div>
		{/if}
	</div>
</div>

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
				{$t('common.search_event')}
			</Dialog.Title>
			<div class="max-h-[80vh] overflow-y-auto">
				Filter
				<div class="text-xs whitespace-pre text-surface-700-300">
					{JSON.stringify(filter, null, 2)}
				</div>

				<button
					class="btn preset-filled-primary-500"
					onclick={searchEvent}
					disabled={$overallStatus === 'fetching'}
				>
					{#if $overallStatus === 'fetching'}
						<LoaderCircle class="size-4 animate-spin" />
						{$t('common.searching')}
					{:else}
						{$t('common.search')}
					{/if}
				</button>
				<p class="mt-2 text-xs text-neutral-500">
					<span class="font-bold">{$t('common.overall_status')}:</span>
					{$overallStatus ?? $t('common.waiting')}
				</p>

				{#if $overallStatus && $overallStatus !== 'fetching' && !$foundEvent}
					<div class="mt-4 rounded-lg bg-neutral-200 p-4 text-center dark:bg-neutral-800">
						{#if $overallStatus === 'timeout'}
							<p class="text-red-500">{$t('common.timeout')}</p>
						{:else}
							<p>{$t('common.event_not_found')}</p>
						{/if}
					</div>
				{/if}

				{#if foundEvent && $foundEvent}
					<h3 class="mt-4 mb-2 font-semibold">{$t('common.found_event')}:</h3>
					<Metadata pubkey={$foundEvent.pubkey}>
						{#snippet loading()}
							<NoteEventRenderer event={$foundEvent} />
						{/snippet}
						{#snippet nodata()}
							<NoteEventRenderer event={$foundEvent} />
						{/snippet}
						{#snippet content({ metadata })}
							<NoteEventRenderer event={$foundEvent} {metadata} />
						{/snippet}
					</Metadata>
				{/if}

				{#if seenOnList.length > 0}
					<h3 class="mt-4 mb-2 font-semibold">{$t('common.seen_on_relays')}:</h3>

					{#each seenOnList as relay}
						<div class="flex w-full flex-wrap gap-1">
							{#if editable}
								<button
									class="preset-outlined-primary-500 btn-sm"
									onclick={() => setRelayHint?.(relay)}>{$t('common.set_relay_hint')}</button
								>{/if}
							{relay}
						</div>
					{/each}
				{/if}
			</div>
			<Dialog.Close
				class="focus-visible:ring-foreground focus-visible:ring-offset-background absolute top-5 right-5 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-[0.98]"
			>
				<div>
					<X class="text-foreground size-5" />
					<span class="sr-only">{$t('common.close')}</span>
				</div>
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
