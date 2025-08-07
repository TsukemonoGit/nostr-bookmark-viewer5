<script lang="ts">
	import { publishEvent } from '$lib/nostr/publish';
	import { bookmarkItemsMap, type BookmarkItem } from '$lib/types/bookmark.svelte';
	import { Plus, Trash2 } from '@lucide/svelte'; // Trash2をインポート
	import type { EventParameters } from 'nostr-typedef';
	import ConfirmDeleteList from '../Layout/ConfirmDeleteList.svelte';
	import { loginUser } from '$lib/utils/stores.svelte';

	interface Props {
		pubkey: string;
		selectedAtag: string | null;
		onItemSelect?: () => void;
	}
	let { selectedAtag = $bindable(), onItemSelect, pubkey }: Props = $props();
	let editable = $derived(loginUser.get() === pubkey);

	let items = $derived({
		BookmarkList: Array.from($bookmarkItemsMap.values()).filter(
			(item) => item.event.kind === 10003
		),
		Bookmarksets: Array.from($bookmarkItemsMap.values())
			.filter((item) => item.event.kind === 30003)
			.sort((a, b) => (a.title || a.identifier || '').localeCompare(b.title || b.identifier || '')),
		Genericlists: Array.from($bookmarkItemsMap.values())
			.filter((item) => item.event.kind === 30001)
			.sort((a, b) => (a.title || a.identifier || '').localeCompare(b.title || b.identifier || ''))
	});

	function handleItemClick(atag: string) {
		selectedAtag = atag;
		onItemSelect?.();
	}

	// 削除処理用の関数を定義
	// 削除処理用の関数を定義
	async function handleDeleteItem(item: BookmarkItem) {
		console.log(`アイテム ${item.atag} を削除します`);

		const ev: EventParameters = {
			kind: 5,
			tags: [
				['a', item.atag],
				['e', item.event.id]
			],
			content: ''
		};

		try {
			await publishEvent(ev, '削除完了', '削除失敗');

			// Nostrイベントが正常に公開されたら、$bookmarkItemsMapから削除する
			$bookmarkItemsMap.delete(item.atag);
			$bookmarkItemsMap = $bookmarkItemsMap;
			console.log(`$bookmarkItemsMapからアイテム ${item.atag} を削除しました`);
		} catch (error) {
			console.error(`削除中にエラーが発生しました:`, error);
		}
	}
</script>

<nav class="h-full overflow-y-auto p-2 text-sm">
	{#each Object.entries(items) as [key, store]}
		<section class="mb-4">
			<h2 class="mb-2 text-2xl font-bold text-neutral-600 dark:text-neutral-400">
				{key}
			</h2>

			{#if key === 'Bookmarksets' && editable}
				<button
					class="mb-2 flex w-full items-center gap-1 rounded-md bg-neutral-200 px-4 py-2 text-left font-semibold text-neutral-800 transition-colors hover:bg-neutral-300 active:bg-neutral-400"
					onclick={() => console.log('新しいブックマークリストを作成')}
				>
					<Plus size="20" />New Bookmark List
				</button>
			{/if}

			<ul class="space-y-1">
				{#each store as item}
					<li class="group flex items-center justify-between">
						<button
							onclick={() => handleItemClick(item.atag)}
							class="flex-1 rounded px-2 py-1 text-left transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800"
							class:selected={selectedAtag === item.atag}
						>
							{item.title || item.identifier || item.event.kind}
						</button>
						{#if editable}
							<ConfirmDeleteList onConfirm={() => handleDeleteItem(item)} {item} />
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</nav>

<style lang="postcss">
	@reference "tailwindcss";
	button.selected {
		@apply bg-neutral-300 font-semibold dark:bg-neutral-700;
	}
</style>
