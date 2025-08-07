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
	import { formatAbsoluteDateFromUnix, toastStore } from '$lib/utils/util';
	import type { EventParameters } from 'nostr-typedef';
	import { nip07Signer } from 'rx-nostr';
	import { publishSignEvent } from '$lib/nostr/nostrSubscriptions';

	interface Props {
		selectedBookmark: BookmarkItem | null;
	}

	interface DndTagItem {
		id: string;
		tag: string[];
		originalIndex?: number;
	}

	let { selectedBookmark }: Props = $props();

	let isPrivate = $state(false);
	let isSorting = $state(false);
	let selectedTagIds = $state(new Set<string>());
	let tagsToDisplay: DndTagItem[] = $state([]);
	let displayTags: DndTagItem[] = $state([]);
	let selectedCount = $derived(selectedTagIds.size);

	let editingTitle = $state(false);
	let editingDescription = $state(false);
	let editingImage = $state(false);
	let editingTagId: string | null = $state(null);

	let tempTitle = $state('');
	let tempDescription = $state('');
	let tempImage = $state('');

	$effect(() => {
		if (selectedBookmark) {
			tempTitle = selectedBookmark.title || '';
			tempDescription = selectedBookmark.description || '';
			tempImage = selectedBookmark.image || '';
		}
	});

	$effect(() => {
		if (tagsToDisplay) {
			untrack(() => {
				const excludedTags = new Set(['d', 'title', 'description', 'image']);
				displayTags = tagsToDisplay.filter((item) => !excludedTags.has(item.tag[0]));
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
		if (selectedBookmark) {
			untrack(async () => {
				selectedTagIds = new Set();
				tagsToDisplay = await getTagsToDisplay();
				originalTags = $state.snapshot(tagsToDisplay);
			});
		}
	});

	$effect(() => {
		isSorting;
		untrack(() => {
			tagsToDisplay = [...originalTags];
			selectedTagIds = new Set();
		});
	});

	async function getTagsToDisplay(): Promise<DndTagItem[]> {
		if (!selectedBookmark) {
			return [];
		}

		let rawTags: string[][];

		if (isPrivate) {
			try {
				const decryptedContent = await window.nostr?.nip04?.decrypt(
					selectedBookmark.event.pubkey,
					selectedBookmark.event.content
				);
				if (!decryptedContent) return [];
				rawTags = JSON.parse(decryptedContent) as string[][];
			} catch (error) {
				return [];
			}
		} else {
			rawTags = selectedBookmark.event.tags;
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
		selectedTagIds = selectedTagIds;
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
		selectedTagIds = newSelectedTagIds;
	}

	function deleteSelectedTags() {
		const selectedCount = selectedTagIds.size;
		if (selectedCount === 0) return;

		if (!confirm(`${selectedCount}個のタグを削除しますか？`)) {
			return;
		}

		const selectedBookmarks = tagsToDisplay.filter((item) => selectedTagIds.has(item.id));
		const indicesToDelete = new Set(
			selectedBookmarks.map((item) => item.originalIndex).filter((idx) => idx !== undefined)
		);

		if (selectedBookmark) {
			const sortedIndices = Array.from(indicesToDelete).sort((a, b) => b - a);
			console.log('削除対象インデックス:', sortedIndices);
		}

		tagsToDisplay = tagsToDisplay.filter((item) => !selectedTagIds.has(item.id));
		originalTags = $state.snapshot(tagsToDisplay);
		selectedTagIds = new Set();

		alert(`${selectedCount}個のタグを削除しました。`);
	}

	function moveSelectedTags() {
		const selectedCount = selectedTagIds.size;
		if (selectedCount === 0) return;

		alert(`${selectedCount}個のタグを他のリストへ移動します。`);
		selectedTagIds = new Set();
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
			originalTags = $state.snapshot(tagsToDisplay);
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

	async function updateTags() {
		if (!selectedBookmark) {
			toastStore.error({
				title: 'エラー',
				description: 'ブックマークが選択されていません。'
			});
			return;
		}

		const tagsToSave = tagsToDisplay.map((item) => item.tag);
		let ev: EventParameters;

		if (isPrivate) {
			try {
				const tagsJson = JSON.stringify(tagsToSave);
				const encryptedContent = await window.nostr?.nip04?.encrypt(
					selectedBookmark.event.pubkey,
					tagsJson
				);
				if (!encryptedContent) {
					toastStore.error({
						title: 'エラー',
						description: 'タグの暗号化に失敗しました。'
					});
					return;
				}
				ev = {
					kind: selectedBookmark.event.kind,
					created_at: Math.floor(Date.now() / 1000),
					tags: $state.snapshot(selectedBookmark.event.tags),
					content: encryptedContent
				};
			} catch (error) {
				console.error('タグの更新中にエラーが発生しました (非公開):', error);
				toastStore.error({
					title: 'エラー',
					description: 'タグの更新に失敗しました。詳細をコンソールで確認してください。'
				});
				return;
			}
		} else {
			const otherTags = tagsToSave.filter(
				(tag) => !['d', 'title', 'description', 'image'].includes(tag[0])
			);
			const newTags: string[][] = [];
			const dTag = selectedBookmark.event.tags.find((tag) => tag[0] === 'd');
			if (dTag) newTags.push(dTag);
			if (selectedBookmark.event.kind !== 10003) {
				if (tempTitle) newTags.push(['title', tempTitle]);
				if (tempDescription) newTags.push(['description', tempDescription]);
				if (tempImage) newTags.push(['image', tempImage]);
			}
			newTags.push(...otherTags);
			ev = {
				kind: selectedBookmark.event.kind,
				created_at: Math.floor(Date.now() / 1000),
				tags: $state.snapshot(newTags),
				content: selectedBookmark.event.content
			};
		}

		const publishPromise = new Promise<number>(async (resolve, reject) => {
			try {
				const signer = nip07Signer();
				const signed = await signer.signEvent(ev);
				const res = await publishSignEvent(signed);
				if (res.length > 0) {
					resolve(res.length); // ここを修正
				} else {
					reject('OKパケットが返ってきませんでした');
				}
			} catch (error) {
				reject(error);
			}
		});

		toastStore.promise(publishPromise, {
			loading: {
				title: '送信中...',
				description: 'タグの更新イベントをリレーに送信しています。'
			},
			success: (result) => ({
				title: '更新完了！',
				description: `${result}個のリレーでタグを更新しました。`
			}),
			error: (error) => ({
				title: '更新失敗',
				description: `エラー: ${typeof error === 'string' ? error : '不明なエラー'}`
			})
		});
	}
	function cancelSorting() {
		tagsToDisplay = [...originalTags];
		isSorting = false;
	}

	function startTagEditing(id: string, tagValue: string) {
		editingTagId = id;
		console.log(tagValue);
	}

	function saveTagEdit(id: string, newTagValue: string) {
		const tagIndex = tagsToDisplay.findIndex((t) => t.id === id);
		if (tagIndex !== -1) {
			const updatedTags = [...tagsToDisplay];
			updatedTags[tagIndex].tag[1] = newTagValue;
			tagsToDisplay = updatedTags;
			originalTags = $state.snapshot(tagsToDisplay);
		}
		editingTagId = null;
		alert('タグを更新しました！');
	}

	function cancelTagEdit() {
		editingTagId = null;
	}

	function saveTitle() {
		if (selectedBookmark) {
			alert('タイトルを更新しました！');
		}
		editingTitle = false;
	}

	function saveDescription() {
		if (selectedBookmark) {
			alert('説明を更新しました！');
		}
		editingDescription = false;
	}

	function saveImage() {
		if (selectedBookmark) {
			alert('画像を更新しました！');
		}
		editingImage = false;
	}
</script>

{#if selectedBookmark}
	<div
		class="max-w-full overflow-x-hidden rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
	>
		{#if selectedBookmark.event.kind !== 10003}
			<div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-[0.3fr_0.7fr]">
				<div>
					<div
						class="flex h-[240px] w-full items-center justify-center rounded bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
					>
						{#if selectedBookmark.image && selectedBookmark.image.trim() !== ''}
							<img
								src={selectedBookmark.image}
								alt={selectedBookmark.title || ''}
								class="h-[240px] w-full rounded object-cover"
							/>
						{:else}
							<span class="text-lg">画像なし</span>
						{/if}
					</div>
					{#if editingImage}
						<div class="mt-2">
							<input
								type="text"
								bind:value={tempImage}
								class="w-full flex-1 rounded-md border p-2"
								placeholder="画像URL"
							/>
							<div class="mt-2 flex flex-wrap items-center justify-end gap-1">
								<button onclick={saveImage} class="rounded-md bg-blue-500 px-4 py-2 text-white"
									>保存</button
								>
								<button
									onclick={() => (editingImage = false)}
									class="rounded-md bg-gray-500 px-4 py-2 text-white">キャンセル</button
								>
							</div>
						</div>
					{:else}
						<button
							onclick={() => (editingImage = true)}
							class=" float-end m-1 self-end rounded-md bg-neutral-200 px-3 py-1 text-sm font-medium dark:bg-neutral-700"
							>修正</button
						>
					{/if}
				</div>

				<div class="flex flex-col">
					{#if editingTitle}
						<input
							type="text"
							bind:value={tempTitle}
							class="mb-2 rounded-md border p-2 text-2xl font-bold"
							placeholder="タイトル"
						/>
						<div class="mb-2 flex justify-end gap-2">
							<button onclick={saveTitle} class="rounded-md bg-blue-500 px-4 py-2 text-white"
								>保存</button
							>
							<button
								onclick={() => (editingTitle = false)}
								class="rounded-md bg-gray-500 px-4 py-2 text-white">キャンセル</button
							>
						</div>
					{:else}
						<div class="flex items-center justify-between">
							<h2
								class="mb-2 text-2xl font-bold text-neutral-900 dark:text-white"
								style="white-space: pre-wrap; word-break: break-word;"
							>
								{selectedBookmark.title || 'タイトルがありません'}
							</h2>
							<button
								onclick={() => (editingTitle = true)}
								class="rounded-md bg-neutral-200 px-3 py-1 text-sm font-medium dark:bg-neutral-700"
								>修正</button
							>
						</div>
					{/if}

					{#if editingDescription}
						<textarea
							bind:value={tempDescription}
							class="flex-1 rounded-md border p-2"
							placeholder="説明"
						></textarea>
						<div class="mt-2 flex justify-end gap-2">
							<button onclick={saveDescription} class="rounded-md bg-blue-500 px-4 py-2 text-white"
								>保存</button
							>
							<button
								onclick={() => (editingDescription = false)}
								class="rounded-md bg-gray-500 px-4 py-2 text-white">キャンセル</button
							>
						</div>
					{:else}
						<div class="flex items-center justify-between">
							<p
								class="text-neutral-600 dark:text-neutral-300"
								style="white-space: pre-wrap; word-break: break-word;"
							>
								{selectedBookmark.description || '説明がありません'}
							</p>
							<button
								onclick={() => (editingDescription = true)}
								class="rounded-md bg-neutral-200 px-3 py-1 text-sm font-medium dark:bg-neutral-700"
								>修正</button
							>
						</div>
					{/if}
				</div>
			</div>
		{/if}
		<div class="mb-6 flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
			<span
				class="rounded bg-primary-100 px-2 py-1 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
				style="white-space: pre-wrap; word-break: break-word;"
			>
				ID: {selectedBookmark.atag}
			</span>
			{#if selectedBookmark.identifier}
				<span
					class="rounded bg-secondary-100 px-2 py-1 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200"
				>
					識別子: {selectedBookmark.identifier}
				</span>
			{/if}
			<span
				class="rounded-md bg-gray-50 px-3 py-1.5 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
			>
				更新日時: {formatAbsoluteDateFromUnix(selectedBookmark.event.created_at)}
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
						class="focus-override shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2  outline-hidden z-50 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-xl border border-neutral-600 bg-neutral-100 select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1 dark:border-neutral-400 dark:bg-neutral-900"
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
						{#if editingTagId === item.id}
							<input type="text" bind:value={item.tag[1]} class="flex-1 rounded-md border p-2" />
							<button
								onclick={() => saveTagEdit(item.id, item.tag[1])}
								class="rounded-md bg-blue-500 px-4 py-2 text-white">保存</button
							>
							<button onclick={cancelTagEdit} class="rounded-md bg-gray-500 px-4 py-2 text-white"
								>キャンセル</button
							>
						{:else}
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
							<button
								onclick={() => startTagEditing(item.id, item.tag[1])}
								class="rounded-md bg-neutral-200 px-3 py-1 text-sm font-medium dark:bg-neutral-700"
								>修正</button
							>
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

{#if selectedBookmark}
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
					class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 dark:disabled:bg-blue-700"
				>
					適応
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
