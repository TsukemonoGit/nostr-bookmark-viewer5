<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import {
		fetchLatestRelayList,
		subscribeBookmarkData,
		serRelays
	} from '$lib/nostr/nostrSubscriptions';
	import { kind10002 } from '$lib/utils/stores.svelte';
	import { QueryClient, QueryClientProvider, type QueryClientConfig } from '@tanstack/svelte-query';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	let isLoadingRelays = $state(false);
	let loadingMessage = $state('');
	let progress = $state(0); // 進捗バー用（今回は使っていませんが残してあります）

	onMount(() => {
		let isMounted = true;

		async function init() {
			if (!data.pubkey) return;

			isLoadingRelays = true;
			progress = 0;
			loadingMessage = 'リレーリストを取得中...';

			progress = 30;
			const relayEvent = await fetchLatestRelayList(data.pubkey);
			//console.log(relayEvent);
			if (relayEvent && isMounted) {
				kind10002.set(relayEvent);
				serRelays(relayEvent.tags);

				progress = 70;
				loadingMessage = 'ブックマークデータを取得中...';
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
				staleTime: 1 * 60 * 60 * 1000, //1時間, //30分　キャッシュされたデータがstateTimeを超えたら新しいデータを取得しようとするが再フェッチが∞なので手動で再フェッチしないと更新されない。また再フェッチで更新されるデータはstaleTimeを過ぎたデータだけ。
				refetchInterval: Infinity,
				gcTime: 1 * 60 * 60 * 1000 //1時間　クエリがまだ使用されている間は何もしません。クエリが使用されなくなった時点でキャッシュが開始されます。時間が経過すると、キャッシュが大きくならないようにデータは "ガベージコレクション "されます。
				//ガベージコレクション（garbage collection）とは、コンピュータプログラムの実行環境などが備える機能の一つで、実行中のプログラムが占有していたメモリ領域のうち不要になったものを自動的に解放し、空き領域として再利用できるようにするもの。そのような処理を実行するプログラムを「ガベージコレクタ」（garbage collector）という。// Rename `cacheTime` to `gcTime`
				//https://github.com/TanStack/query/blob/a300d484750edb4b64bdefcc86abaac305d73b13/docs/framework/react/guides/migrating-to-v5.md#rename-cachetime-to-gctime
			}
		}
	};

	const queryClient = new QueryClient(config);

	let SvelteQueryDevtools: any = $state();

	// Conditionally load SvelteQueryDevtools during development
	if (import.meta.env.MODE === 'development') {
		// Dynamically import SvelteQueryDevtools only in development mode
		import('@tanstack/svelte-query-devtools').then((module) => {
			SvelteQueryDevtools = module.SvelteQueryDevtools;
		});
	}
</script>

<QueryClientProvider client={queryClient}>
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
