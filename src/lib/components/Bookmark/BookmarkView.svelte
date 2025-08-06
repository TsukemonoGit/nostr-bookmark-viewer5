<script lang="ts">
	import type { BookmarkItem } from '$lib/types/bookmark.svelte';
	import Relay from '../Tags/Relay.svelte';
	import Hashtag from '../Tags/Hashtag.svelte';
	import NaddrEvent from '../Tags/NaddrEvent.svelte';
	import NoteEvent from '../Tags/NoteEvent.svelte';
	import Url from '../Tags/Url.svelte';
	import { bookmarkableTagsSet } from '$lib/utils/constants';

	interface Props {
		selectedItem: BookmarkItem | null;
	}

	let { selectedItem }: Props = $props();

	// 選択されたタグを管理する配列
	let selectedTags: string[][] = $state([]);

	// 全て選択/選択解除を切り替える関数
	function toggleSelectAll() {
		if (selectedItem && selectedTags.length === selectedItem.event.tags.length) {
			selectedTags = [];
		} else {
			selectedTags = selectedItem ? [...selectedItem.event.tags] : [];
		}
	}

	// タグが選択されているかチェックする関数
	function isTagSelected(tag: string[]) {
		return selectedTags.some((t) => t[0] === tag[0] && t[1] === tag[1]);
	}

	// チェックボックスの状態が変更されたときに呼ばれる関数
	function handleCheckboxChange(tag: string[]) {
		if (isTagSelected(tag)) {
			selectedTags = selectedTags.filter((t) => t[0] !== tag[0] || t[1] !== tag[1]);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	}

	// 選択したタグを削除する関数 (ダミー)
	function deleteSelectedTags() {
		alert(`${selectedTags.length}個のタグを削除します。`);
		// ここに実際の削除ロジックを実装
		selectedTags = [];
	}

	// 選択したタグを他のリストへ移動する関数 (ダミー)
	function moveSelectedTags() {
		alert(`${selectedTags.length}個のタグを他のリストへ移動します。`);
		// ここに実際の移動ロジックを実装
		selectedTags = [];
	}

	// 新しいタグを追加する関数 (ダミー)
	function addNewTag() {
		const newTag = prompt('新しいタグを入力してください:');
		if (newTag) {
			alert(`新しいタグ "${newTag}" を追加します。`);
			// ここに実際のタグ追加ロジックを実装
		}
	}
</script>

{#if selectedItem}
	<div
		class="max-w-full overflow-x-hidden rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
	>
		<div class="mb-6 {selectedItem.image ? 'grid grid-cols-1 gap-6 md:grid-cols-2' : ''}">
			{#if selectedItem.image}
				<div>
					<img
						src={selectedItem.image}
						alt={selectedItem.title || ''}
						class="h-auto max-h-[300px] w-full rounded object-cover"
					/>
				</div>
			{/if}
			<div class="flex flex-col">
				{#if selectedItem.title}
					<h2
						class="mb-2 text-2xl font-bold text-neutral-900 dark:text-white"
						style=" white-space: pre-wrap;
		word-break: break-word;"
					>
						{selectedItem.title}
					</h2>
				{/if}
				{#if selectedItem.description}
					<p
						class="text-neutral-600 dark:text-neutral-300"
						style=" white-space: pre-wrap;
		word-break: break-word;"
					>
						{selectedItem.description}
					</p>
				{/if}
			</div>
		</div>

		<div class="mb-6 flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
			<span
				class="rounded bg-primary-100 px-2 py-1 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
				style=" white-space: pre-wrap;
		word-break: break-word;">ID: {selectedItem.atag}</span
			>
			{#if selectedItem.identifier}
				<span
					class="rounded bg-secondary-100 px-2 py-1 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200"
					>識別子: {selectedItem.identifier}</span
				>
			{/if}
		</div>

		<div class="mb-4 flex items-center justify-between">
			<label class="flex items-center space-x-2">
				<input
					type="checkbox"
					class="form-checkbox"
					onchange={toggleSelectAll}
					checked={selectedItem &&
						selectedTags.length === selectedItem.event.tags.length &&
						selectedTags.length > 0}
				/>
				<span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">全て選択</span>
			</label>
		</div>

		<div class="space-y-2">
			{#each selectedItem?.event.tags as tag, index}
				<div
					class="flex items-center space-x-4 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800"
					style=" white-space: pre-wrap;
		word-break: break-word;"
				>
					<input
						type="checkbox"
						class="form-checkbox h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
						checked={isTagSelected(tag)}
						onchange={() => handleCheckboxChange(tag)}
					/>
					<div class="flex-1">
						{#if tag[0] === 'e'}
							<NoteEvent {tag} />
						{:else if tag[0] === 'a'}
							<NaddrEvent {tag} />
						{:else if tag[0] === 'r'}
							{#if tag[1].startsWith('ws')}
								<Relay {tag} />
							{:else}
								<Url {tag} />
							{/if}
						{:else if tag[0] === 't'}
							<Hashtag {tag} />
						{:else}
							{tag}
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div
		class="rounded-lg bg-neutral-50 p-8 text-center text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
	>
		ブックマークが選択されていません
	</div>
{/if}

<div
	class="fixed right-4 bottom-4 z-50 flex items-center space-x-4 rounded-lg bg-neutral-900 p-4 text-white shadow-xl dark:bg-neutral-900"
>
	<div class="flex items-center space-x-2">
		{#if selectedTags.length > 0}
			<span class="text-sm font-bold">
				{selectedTags.length}個選択中
			</span>
		{/if}
		<button
			onclick={deleteSelectedTags}
			disabled={selectedTags.length === 0}
			class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-700"
		>
			削除
		</button>
		<button
			onclick={moveSelectedTags}
			disabled={selectedTags.length === 0}
			class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-700"
		>
			他のリストへ移動
		</button>
	</div>
	<button
		onclick={addNewTag}
		class="rounded-md bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-700"
	>
		タグを追加
	</button>
</div>
