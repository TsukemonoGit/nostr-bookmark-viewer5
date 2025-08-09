<script lang="ts">
	import Sidebar from '$lib/components/Bookmark/Sidebar.svelte';
	import BookmarkView from '$lib/components/Bookmark/BookmarkView.svelte';
	import { bookmarkItemsMap, type BookmarkItem } from '$lib/types/bookmark.svelte';
	import RelayStatus from '$lib/components/RelayStatus.svelte';
	import type { LayoutData } from './$types';
	import { untrack } from 'svelte';
	import { t } from '@konemono/svelte5-i18n';

	let { data }: { data: LayoutData } = $props();
	let selectedAtag: string | null = $state(null);
	let showMobileSidebar = $state(false);
	let selectedItem: BookmarkItem | null = $derived(
		selectedAtag ? $bookmarkItemsMap.get(selectedAtag) || null : null
	);
	let mainContent: HTMLElement | undefined = $state();

	function closeMobileSidebar() {
		showMobileSidebar = false;
	}

	function handleBackdropClick() {
		closeMobileSidebar();
	}

	$effect(() => {
		if (selectedItem) {
			untrack(() => {
				if (mainContent) {
					mainContent.scrollTo({ top: 0 });
				}
			});
		}
	});
</script>

<div class="flex h-screen w-full overflow-hidden">
	<!-- Desktop Sidebar -->
	<aside
		class="hidden w-64 shrink-0 border-r border-neutral-300 bg-neutral-100 md:block dark:border-neutral-700 dark:bg-neutral-900"
	>
		<Sidebar bind:selectedAtag pubkey={data.pubkey} />
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
				{$t('bookmark.menu')}
			</button>
			{#if selectedItem}
				<div class="text-xs text-neutral-700 dark:text-neutral-300">
					kind: {selectedItem.event.kind}
					{#if selectedItem.identifier}
						ID: {selectedItem.identifier}
					{/if}
				</div>
			{/if}
			<div class="flex flex-auto justify-end"><RelayStatus /></div>
		</header>

		<!-- Mobile Content -->
		<main
			bind:this={mainContent}
			class="max-w-full flex-1 overflow-x-hidden overflow-y-auto bg-white p-1 pb-16 dark:bg-black"
		>
			<BookmarkView selectedBookmark={selectedItem} />
		</main>
	</div>
</div>

{#if showMobileSidebar}
	<div class="fixed inset-0 z-50 md:hidden">
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="bg-opacity-50 absolute inset-0 bg-neutral-900/50"
			onclick={handleBackdropClick}
		></div>

		<!-- Sidebar -->
		<aside class="absolute top-0 left-0 h-full w-64 bg-neutral-100 shadow-lg dark:bg-neutral-900">
			<!-- Close Button -->
			<div
				class="flex items-center justify-between border-b border-neutral-300 px-4 py-3 dark:border-neutral-700"
			>
				<span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
					{$t('bookmark.title')}
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
				<Sidebar bind:selectedAtag onItemSelect={closeMobileSidebar} pubkey={data.pubkey} />
			</div>
		</aside>
	</div>
{/if}
