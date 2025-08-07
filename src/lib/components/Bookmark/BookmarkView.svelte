<script lang="ts">
	import type { BookmarkItem } from '$lib/types/bookmark.svelte';
	import Relay from '../Tags/Relay.svelte';
	import Hashtag from '../Tags/Hashtag.svelte';
	import NaddrEvent from '../Tags/NaddrEvent.svelte';
	import NoteEvent from '../Tags/NoteEvent.svelte';

	import { dndzone } from 'svelte-dnd-action';
	import { untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import { Select } from 'bits-ui';
	import Url from '../Tags/Url.svelte';
	import { ChevronsUpDown } from '@lucide/svelte';
	import { formatAbsoluteDateFromUnix } from '$lib/utils/util';

	interface Props {
		selectedItem: BookmarkItem | null;
	}

	interface DndTagItem {
		id: string;
		tag: string[];
		originalIndex?: number;
	}

	let { selectedItem }: Props = $props();

	let isPrivate = $state(false);
	let isSorting = $state(false);
	let selectedTagIds = $state(new Set<string>());
	let tagsToDisplay: DndTagItem[] = $state([]);
	let displayTags: DndTagItem[] = $state([]);
	let selectedCount = $derived(selectedTagIds.size);
	$effect(() => {
		if (tagsToDisplay) {
			untrack(() => {
				displayTags = tagsToDisplay.filter((item) => item.tag[0] !== 'd');
			});
		}
	});
	let originalTags: DndTagItem[] = $state([]);

	const flipDurationMs = 200;
	const selectItem = [
		{ value: 'selecting', label: '選択モード' },
		{ value: 'sorting', label: '並べ替えモード' }
	];

	$effect(() => {
		isPrivate;
		if (selectedItem) {
			untrack(async () => {
				selectedTagIds = new Set(); // 新しいSetで置き換える
				tagsToDisplay = await getTagsToDisplay();
				originalTags = $state.snapshot(tagsToDisplay);
			});
		}
	});

	$effect(() => {
		isSorting;

		untrack(() => {
			//モードが変わったらリセット
			tagsToDisplay = [...originalTags];
			selectedTagIds = new Set(); // 新しいSetで置き換える
		});
	});

	async function getTagsToDisplay(): Promise<DndTagItem[]> {
		if (!selectedItem) {
			return [];
		}

		let rawTags: string[][];

		if (isPrivate) {
			try {
				const decryptedContent = await window.nostr?.nip04?.decrypt(
					selectedItem.event.pubkey,
					selectedItem.event.content
				);
				if (!decryptedContent) return [];
				rawTags = JSON.parse(decryptedContent) as string[][];
			} catch (error) {
				return [];
			}
		} else {
			rawTags = selectedItem.event.tags;
		}

		return rawTags.map((tag, originalIndex) => ({
			id: `${originalIndex}`,
			tag,
			originalIndex
		}));
	}

	function toggleSelectAll(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.checked) {
			selectedTagIds = new Set(displayTags.map((item) => item.id));
		} else {
			selectedTagIds.clear();
		}
		selectedTagIds = selectedTagIds; // リアクティブ更新をトリガー
	}

	function isTagSelected(id: string): boolean {
		return selectedTagIds.has(id);
	}

	function toggleTagSelection(id: string) {
		const newSelectedTagIds = new Set(selectedTagIds);
		if (newSelectedTagIds.has(id)) {
			newSelectedTagIds.delete(id);
		} else {
			newSelectedTagIds.add(id);
		}
		selectedTagIds = newSelectedTagIds; // 新しいSetで置き換える
	}

	function deleteSelectedTags() {
		const selectedCount = selectedTagIds.size;
		if (selectedCount === 0) return;

		if (!confirm(`${selectedCount}個のタグを削除しますか？`)) {
			return;
		}

		const selectedItems = tagsToDisplay.filter((item) => selectedTagIds.has(item.id));
		const indicesToDelete = new Set(
			selectedItems.map((item) => item.originalIndex).filter((idx) => idx !== undefined)
		);

		if (selectedItem) {
			const sortedIndices = Array.from(indicesToDelete).sort((a, b) => b - a);
			console.log('削除対象インデックス:', sortedIndices);
		}

		tagsToDisplay = tagsToDisplay.filter((item) => !selectedTagIds.has(item.id));
		originalTags = $state.snapshot(tagsToDisplay); // originalTagsも更新
		selectedTagIds = new Set(); // 新しいSetで置き換える

		alert(`${selectedCount}個のタグを削除しました。`);
	}

	function moveSelectedTags() {
		const selectedCount = selectedTagIds.size;
		if (selectedCount === 0) return;

		alert(`${selectedCount}個のタグを他のリストへ移動します。`);
		selectedTagIds = new Set(); // 新しいSetで置き換える
	}

	function addNewTag() {
		const newTagValue = prompt('新しいタグを入力してください:');
		if (newTagValue?.trim()) {
			const newId = `tag-new-${Date.now()}`;
			const newTag: DndTagItem = {
				id: newId,
				tag: ['t', newTagValue.trim()]
			};
			tagsToDisplay = [...tagsToDisplay, newTag];
			originalTags = $state.snapshot(tagsToDisplay); // originalTagsも更新
			alert(`新しいタグ "${newTagValue}" を追加しました。`);
		}
	}

	function handleDndConsider(e: CustomEvent<{ items: DndTagItem[] }>) {
		const updatedDisplayTags = e.detail.items;
		const dTags = tagsToDisplay.filter((item) => item.tag[0] === 'd');
		tagsToDisplay = [...(dTags || []), ...updatedDisplayTags];
	}

	function handleDndFinalize(e: CustomEvent<{ items: DndTagItem[] }>) {
		const updatedDisplayTags = e.detail.items;
		const dTags = tagsToDisplay.filter((item) => item.tag[0] === 'd');
		tagsToDisplay = [...(dTags || []), ...updatedDisplayTags];
	}

	function updateTags() {
		alert('タグの並び順を更新しました！');
		isSorting = false;
	}

	function cancelSorting() {
		tagsToDisplay = [...originalTags];
		isSorting = false;
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
						style="white-space: pre-wrap; word-break: break-word;"
					>
						{selectedItem.title}
					</h2>
				{/if}
				{#if selectedItem.description}
					<p
						class="text-neutral-600 dark:text-neutral-300"
						style="white-space: pre-wrap; word-break: break-word;"
					>
						{selectedItem.description}
					</p>
				{/if}
			</div>
		</div>
		<div class="mb-6 flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
			<span
				class="rounded bg-primary-100 px-2 py-1 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
				style="white-space: pre-wrap; word-break: break-word;"
			>
				ID: {selectedItem.atag}
			</span>
			{#if selectedItem.identifier}
				<span
					class="rounded bg-secondary-100 px-2 py-1 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200"
				>
					識別子: {selectedItem.identifier}
				</span>
			{/if}
			<span
				class="rounded-md bg-gray-50 px-3 py-1.5 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
			>
				更新日時: {formatAbsoluteDateFromUnix(selectedItem.event.created_at)}
			</span>
		</div>
		<div class="mb-4 flex items-center justify-between">
			<Select.Root
				items={selectItem}
				type="single"
				onValueChange={(v) => (isSorting = v === 'sorting')}
			>
				<Select.Trigger
					class="data-placeholder:text-foreground-alt/50 inline-flex h-8 w-[296px] touch-none items-center rounded-md border border-neutral-600 px-[11px] text-sm transition-colors select-none dark:border-neutral-400"
				>
					{isSorting ? selectItem[1].label : selectItem[0].label}
					<ChevronsUpDown class="text-muted-foreground ml-auto size-6" />
				</Select.Trigger>
				<Select.Portal>
					<Select.Content
						class="focus-override shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-xl border border-neutral-600 bg-neutral-100  outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1 dark:border-neutral-400 dark:bg-neutral-900"
					>
						<Select.Viewport class="p-1">
							{#each selectItem as item, i (i + item.value)}
								<Select.Item
									class="rounded-button data-highlighted:bg-muted flex h-10 w-full items-center py-3 pr-1.5 pl-5 text-sm capitalize outline-hidden select-none data-disabled:opacity-50"
									value={item.value}
									label={item.label}>{item.label}</Select.Item
								>
							{/each}</Select.Viewport
						>
					</Select.Content></Select.Portal
				>
			</Select.Root>
			<div class="flex items-center space-x-2">
				<button
					class="rounded-md px-3 py-1 text-sm font-medium transition-colors {isPrivate
						? 'bg-neutral-200 dark:bg-neutral-700'
						: 'bg-blue-500 text-white'}"
					onclick={() => (isPrivate = false)}
				>
					公開
				</button>
				<button
					class="rounded-md px-3 py-1 text-sm font-medium transition-colors {isPrivate
						? 'bg-blue-500 text-white'
						: 'bg-neutral-200 dark:bg-neutral-700'}"
					onclick={() => (isPrivate = true)}
				>
					非公開
				</button>
			</div>
		</div>
		<div class="mb-4 flex items-center justify-between">
			<label class="flex items-center space-x-2">
				<input
					type="checkbox"
					class="form-checkbox"
					onchange={(e) => toggleSelectAll(e)}
					checked={displayTags.length > 0 &&
						selectedCount === displayTags.length &&
						selectedCount !== 0}
					disabled={isSorting}
				/>
				<span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
					{isSorting ? 'タグをドラッグして並べ替えてください' : '全て選択'}
				</span>
			</label>
		</div>

		<div
			use:dndzone={{
				items: displayTags,
				flipDurationMs,
				dropTargetStyle: {},
				dragDisabled: !isSorting
			}}
			onconsider={handleDndConsider}
			onfinalize={handleDndFinalize}
		>
			{#each displayTags as item (item.id)}
				<div animate:flip={{ duration: flipDurationMs }}>
					<div
						class="my-1 flex items-center space-x-4 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800 {isTagSelected(
							item.id
						)
							? 'ring-2 ring-blue-500'
							: ''} {isSorting ? 'cursor-grab' : ''}"
						style="white-space: pre-wrap; word-break: break-word;"
					>
						{#if isSorting}
							<span class="handle text-neutral-400">⋮⋮</span>
						{:else}
							<input
								type="checkbox"
								class="form-checkbox h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
								checked={isTagSelected(item.id)}
								onchange={() => toggleTagSelection(item.id)}
							/>
						{/if}
						<div class="flex-1">
							{#if item.tag[0] === 'e'}
								<NoteEvent tag={item.tag} />
							{:else if item.tag[0] === 'a'}
								<NaddrEvent tag={item.tag} />
							{:else if item.tag[0] === 'r'}
								{#if item.tag[1]?.startsWith('ws')}
									<Relay tag={item.tag} />
								{:else}
									<Url tag={item.tag} />
								{/if}
							{:else if item.tag[0] === 't'}
								<Hashtag tag={item.tag} />
							{:else}
								<div class="text-sm text-neutral-600 dark:text-neutral-400">
									{JSON.stringify(item.tag)}
								</div>
							{/if}
						</div>
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

{#if selectedItem}
	<div
		class="fixed right-4 bottom-4 z-50 flex items-center space-x-4 rounded-lg bg-neutral-900 p-4 text-white shadow-xl dark:bg-neutral-900"
	>
		<div class="flex items-center space-x-2">
			{#if selectedCount > 0 && !isSorting}
				<span class="text-sm font-bold">
					{selectedCount}個選択中
				</span>
			{/if}
			{#if !isSorting}
				<button
					onclick={deleteSelectedTags}
					disabled={selectedCount === 0 || isSorting}
					class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300 dark:disabled:bg-red-700"
				>
					削除
				</button>
				<button
					onclick={moveSelectedTags}
					disabled={selectedCount === 0 || isSorting}
					class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 dark:disabled:bg-blue-700"
				>
					他のリストへ移動
				</button>
			{:else}
				<button
					onclick={cancelSorting}
					class="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-700"
				>
					キャンセル
				</button>
				<button
					onclick={updateTags}
					class="rounded-md bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-700"
				>
					OK
				</button>
			{/if}
		</div>
		<button
			onclick={addNewTag}
			class="rounded-md bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
		>
			タグを追加
		</button>
	</div>
{/if}

<style>
	.cursor-grab {
		cursor: grab;
	}
</style>
