<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import {
		fetchLatestRelayList,
		subscribeBookmarkData,
		serRelays,
		relaysReconnectChallenge,
		resetNostr
	} from '$lib/nostr/nostrSubscriptions';
	import { kind10002, queryClient } from '$lib/utils/stores.svelte';
	import { QueryClient, QueryClientProvider, type QueryClientConfig } from '@tanstack/svelte-query';
	import { t } from '@konemono/svelte5-i18n';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	let isLoadingRelays = $state(false);
	let loadingMessage = $state('');
	let progress = $state(0);

	onMount(() => {
		let isMounted = true;

		async function init() {
			if (!data.pubkey) return;

			resetNostr();

			isLoadingRelays = true;
			progress = 0;
			loadingMessage = $t('relay.loadingRelayList');

			progress = 30;
			const relayEvent = await fetchLatestRelayList(data.pubkey);

			if (relayEvent && isMounted) {
				kind10002.set(relayEvent);
				serRelays(relayEvent.tags);

				progress = 70;
				loadingMessage = $t('relay.loadingBookmarkData');
				subscribeBookmarkData(data.pubkey);
			}

			progress = 100;
			isLoadingRelays = false;
			loadingMessage = '';
		}

		init();

		return () => {
			isMounted = false;
		};
	});

	const config: QueryClientConfig = {
		defaultOptions: {
			queries: {
				staleTime: 1 * 60 * 60 * 1000,
				refetchInterval: Infinity,
				gcTime: 1 * 60 * 60 * 1000
			}
		}
	};

	queryClient.set(new QueryClient(config));

	let SvelteQueryDevtools: any = $state();

	if (import.meta.env.MODE === 'development') {
		import('@tanstack/svelte-query-devtools').then((module) => {
			SvelteQueryDevtools = module.SvelteQueryDevtools;
		});
	}

	function onVisibilityChange() {
		if (document?.visibilityState === 'visible') {
			relaysReconnectChallenge();
		}
	}
</script>

<svelte:document on:visibilitychange={onVisibilityChange} />
<QueryClientProvider client={queryClient.get()}>
	{@render children?.()}
	{#if SvelteQueryDevtools}
		<SvelteQueryDevtools initialIsOpen={false} />
	{/if}
</QueryClientProvider>

{#if isLoadingRelays}
	<div
		class="fixed bottom-20 left-1/2 flex -translate-1/2 flex-col items-center justify-center gap-4"
	>
		<!-- 回転する円 -->
		<div class="relative h-16 w-16">
			<svg class="h-16 w-16 animate-spin" viewBox="0 0 36 36" fill="none" stroke="none">
				<!-- 薄い背景円 -->
				<circle
					cx="18"
					cy="18"
					r="16"
					stroke="var(--color-secondary-300, #cbd5e1)"
					stroke-width="4"
					fill="none"
				/>
				<!-- 回転弧 -->
				<circle
					cx="18"
					cy="18"
					r="16"
					stroke="var(--color-primary-500, #6366f1)"
					stroke-width="4"
					stroke-dasharray="60 100"
					stroke-linecap="round"
					class="origin-center"
				/>
			</svg>
		</div>

		<!-- ローディングメッセージ -->
		<span class="text-primary-content dark:text-primary-content text-center text-sm font-medium">
			{loadingMessage}
		</span>
	</div>
{/if}
