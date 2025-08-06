<script lang="ts">
	import { bookmarkItemsMap } from '$lib/types/bookmark.svelte';
	import { Plus } from '@lucide/svelte';

	interface Props {
		selectedAtag: string | null;
		onItemSelect?: () => void;
	}
	let { selectedAtag = $bindable(), onItemSelect }: Props = $props();

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
</script>

<nav class="h-full overflow-y-auto p-2 text-sm">
	{#each Object.entries(items) as [key, store]}
		<section class="mb-4">
			<h2 class="mb-2 text-2xl font-bold text-neutral-600 dark:text-neutral-400">
				{key}
			</h2>

			{#if key === 'Bookmarksets'}
				<button
					class="flex w-full items-center gap-1 rounded-md bg-neutral-200 px-4 py-2 text-left font-semibold text-neutral-800 transition-colors hover:bg-neutral-300 active:bg-neutral-400"
					onclick={() => console.log('新しいブックマークリストを作成')}
				>
					<Plus size="20" />New Bookmark List
				</button>
			{/if}

			<ul class="space-y-1">
				{#each store as item}
					<li>
						<button
							onclick={() => handleItemClick(item.atag)}
							class="w-full rounded px-2 py-1 text-left transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800"
							class:selected={selectedAtag === item.atag}
						>
							{item.title || item.identifier || item.event.kind}
						</button>
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
