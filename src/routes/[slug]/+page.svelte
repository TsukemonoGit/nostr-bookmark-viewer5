<script lang="ts">
	import Sidebar from '$lib/components/Bookmark/Sidebar.svelte';
	import BookmarkView from '$lib/components/Bookmark/BookmarkView.svelte';
	import { bookmarkItemsMap, type BookmarkItem } from '$lib/types/bookmark.svelte';
	import RelayStatus from '$lib/components/RelayStatus.svelte';

	let selectedAtag: string | null = $state(null);
	let showMobileSidebar = $state(false);
	//$inspect(selectedAtag);
	let selectedItem: BookmarkItem | null = $derived(
		selectedAtag ? $bookmarkItemsMap.get(selectedAtag) || null : null
	);

	// モバイルサイドバーを閉じる関数
	function closeMobileSidebar() {
		showMobileSidebar = false;
	}

	// サイドバー外クリックで閉じる
	function handleBackdropClick() {
		closeMobileSidebar();
	}
</script>

<div class="flex h-screen w-full overflow-hidden">
	<!-- Desktop Sidebar -->
	<aside
		class="hidden w-64 shrink-0 border-r border-neutral-300 bg-neutral-100 md:block dark:border-neutral-700 dark:bg-neutral-900"
	>
		<Sidebar bind:selectedAtag />
	</aside>

	<!-- Mobile Layout Container -->
	<div class="flex w-full flex-col">
		<!-- Mobile Header -->
		<header
			class="flex shrink-0 items-center justify-between border-b border-neutral-300 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-black"
		>
			<button
				onclick={() => (showMobileSidebar = !showMobileSidebar)}
				class="flex h-6 items-center gap-2 rounded px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 md:hidden dark:text-neutral-300 dark:hover:bg-neutral-800"
			>
				<span class="text-lg">☰</span>
				メニュー
			</button>
			<div class="flex flex-auto justify-end"><RelayStatus /></div>
			<!-- <div class="truncate text-xs text-neutral-500 dark:text-neutral-400">
				{selectedItem?.title || '未選択'}
			</div> -->
		</header>

		<!-- Mobile Content -->
		<main class="max-w-full flex-1 overflow-x-hidden overflow-y-auto bg-white dark:bg-black">
			<div class="p-4">
				<BookmarkView {selectedItem} />
			</div>
		</main>
	</div>
</div>

<!-- Mobile Sidebar Overlay -->
{#if showMobileSidebar}
	<div class="fixed inset-0 z-50 md:hidden">
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="bg-opacity-50 absolute inset-0 bg-black" onclick={handleBackdropClick}></div>

		<!-- Sidebar -->
		<aside class="absolute top-0 left-0 h-full w-64 bg-neutral-100 shadow-lg dark:bg-neutral-900">
			<!-- Close Button -->
			<div
				class="flex items-center justify-between border-b border-neutral-300 px-4 py-3 dark:border-neutral-700"
			>
				<span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
					ブックマーク
				</span>
				<button
					onclick={closeMobileSidebar}
					class="rounded p-1 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
				>
					✕
				</button>
			</div>

			<!-- Sidebar Content -->
			<div class="h-full overflow-y-auto">
				<Sidebar bind:selectedAtag onItemSelect={closeMobileSidebar} />
			</div>
		</aside>
	</div>
{/if}
