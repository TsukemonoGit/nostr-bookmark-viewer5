<script lang="ts">
	import { publishEvent } from '$lib/nostr/publish';
	import { bookmarkItemsMap, type BookmarkItem } from '$lib/types/bookmark.svelte';
	import { Github, House } from '@lucide/svelte';
	import type { EventParameters } from 'nostr-typedef';
	import ConfirmDeleteList from '../Layout/ConfirmDeleteList.svelte';
	import { loginUser } from '$lib/utils/stores.svelte';
	import CreateNewList from '../Layout/CreateNewList.svelte';
	import type { CreateData } from '$lib/types/utiles';
	import { toastStore } from '$lib/utils/util';
	import { t } from '@konemono/svelte5-i18n';
	import Link from '../Layout/Link.svelte';
	import { goto } from '$app/navigation';
	import About from './About.svelte';
	import { tick } from 'svelte';

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

	async function handleItemClick(atag: string) {
		selectedAtag = atag;
		onItemSelect?.();
	}

	async function handleDeleteItem(item: BookmarkItem) {
		console.log(`${$t('bookmark.deleteItem')} ${item.atag}`);

		const ev: EventParameters = {
			kind: 5,
			tags: [
				['a', item.atag],
				['e', item.event.id]
			],
			content: ''
		};

		try {
			await publishEvent(ev, $t('tagEditor.actions.delete'));

			$bookmarkItemsMap.delete(item.atag);
			$bookmarkItemsMap = $bookmarkItemsMap;
			console.log(`${$t('bookmark.removedFromMap')} ${item.atag}`);
		} catch (error) {
			console.error(`${$t('bookmark.deleteError')}`, error);
		}
	}

	async function createNewList(data: CreateData) {
		console.log($t('bookmark.createNewList'), data);
		if (!data.d) {
			toastStore.error({
				title: $t('bookmark.error'),
				description: $t('bookmark.requiredDTag'),
				duration: 10000
			});
			return;
		}
		const tags = [['d', data.d]];
		if (data.title) tags.push(['title', data.title]);
		if (data.image) tags.push(['image', data.image]);
		if (data.description) tags.push(['description', data.description]);

		const ev: EventParameters = {
			kind: 30003,
			content: '',
			tags: tags
		};

		console.log($t('bookmark.eventCreated'), ev);
		await publishEvent(ev, $t('bookmark.create'));
	}

	function goToTop() {
		// Topページに戻る処理
		goto('/');
	}
</script>

<nav class="h-full overflow-y-auto p-2 text-sm">
	{#each Object.entries(items) as [key, store]}
		<section class="mb-4">
			<h2
				class="sticky top-0 mb-2 rounded-sm bg-neutral-100/50 text-2xl font-bold text-neutral-700 backdrop-blur-sm dark:bg-neutral-900/50 dark:text-neutral-300"
			>
				{$t(`bookmark.sections.${key}`)}
			</h2>

			{#if key === 'Bookmarksets' && editable}
				<CreateNewList onConfirm={createNewList} />
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
							<ConfirmDeleteList
								onConfirm={() => handleDeleteItem(item)}
								{item}
								isSelected={selectedAtag === item.atag}
							/>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/each}

	<!-- フッター項目 -->
	<section class="mt-10 border-t border-neutral-200 pt-3 dark:border-neutral-700">
		<div class="flex flex-col space-y-1 opacity-70">
			<button
				onclick={goToTop}
				class="flex items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors hover:bg-neutral-200 hover:opacity-100 dark:hover:bg-neutral-800"
			>
				<House size={14} />
				{$t('footer.top')}
			</button>
			<Link
				href="https://github.com/TsukemonoGit/nostr-bookmark-viewer5"
				class="flex items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors hover:bg-neutral-200 hover:opacity-100 dark:hover:bg-neutral-800"
			>
				<Github size={14} />
				GitHub
			</Link>
			<About />
		</div>
	</section>
</nav>

<style lang="postcss">
	@reference "tailwindcss";
	button.selected {
		@apply bg-neutral-300 font-semibold dark:bg-neutral-700;
	}
</style>
