<script lang="ts">
	import { bookmarkItemsMap, type BookmarkItem } from '$lib/types/bookmark.svelte';

	import { dndzone } from 'svelte-dnd-action';
	import { untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import { Select } from 'bits-ui';

	import { ChevronsUpDown } from '@lucide/svelte';
	import { formatAbsoluteDateFromUnix, toastStore } from '$lib/utils/util';
	import type { EventParameters } from 'nostr-typedef';

	import ConfirmDeleteDialog from '../Layout/ConfirmDeleteDialog.svelte';
	import TagRenderer from './TagRenderer.svelte';
	import type { DndTagItem } from '$lib/types/utiles';
	import { loginUser } from '$lib/utils/stores.svelte';
	import CreateNewTag from '../Layout/CreateNewTag.svelte';
	import MoveTagButton from './MoveTagButton.svelte';
	import { get } from 'svelte/store';
	import { publishEvent } from '$lib/nostr/publish';
	import ItemMenu from '../Layout/ItemMenu.svelte';

	interface Props {
		selectedBookmark: BookmarkItem | null;
	}

	let { selectedBookmark }: Props = $props();

	let editable = $derived(
		(selectedBookmark && loginUser.get() === selectedBookmark.event.pubkey) || false
	);
	let isPrivate = $state(false);
	let isSorting = $state(false);
	let selectedTagIds = $state(new Set<string>());
	let tagsToDisplay: DndTagItem[] = $state([]); //dとかフィルターする前の配列
	let displayTags: DndTagItem[] = $state([]); //画面に出すものにフィルターした配列
	let selectedCount = $derived(selectedTagIds.size);

	let editingTitle = $state(false);
	let editingDescription = $state(false);
	let editingImage = $state(false);

	let tempTitle = $state('');
	let tempDescription = $state('');
	let tempImage = $state('');

	$effect(() => {
		if (selectedBookmark) {
			untrack(() => {
				tempTitle = selectedBookmark.title || '';
				tempDescription = selectedBookmark.description || '';
				tempImage = selectedBookmark.image || '';
			});
		}
	});
	const excludedTags = new Set(['d', 'title', 'description', 'image']);

	let originalTags: DndTagItem[] = $state([]);

	const flipDurationMs = 200;
	const selectItem = [
		{ value: 'selecting', label: '選択モード' },
		{ value: 'sorting', label: '並べ替えモード' }
	];
	$effect(() => {
		if (tagsToDisplay) {
			displayTags = tagsToDisplay.filter((item) => !excludedTags.has(item.tag[0]));
		}
	});
	$effect(() => {
		isPrivate;
		if (selectedBookmark) {
			untrack(async () => {
				selectedTagIds = new Set();
				originalTags = await getTagsToDisplay();
				tagsToDisplay = [...originalTags];
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
			selectedTagIds = new Set();
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

	let selectedTags = $derived(tagsToDisplay.filter((item) => selectedTagIds.has(item.id)));

	//削除
	async function deleteSelectedTags() {
		const selectedCount = selectedTagIds.size;
		if (selectedCount === 0 || !selectedBookmark) return;

		const deletedList = tagsToDisplay.filter((item) => !selectedTagIds.has(item.id));

		const tagsToSave = deletedList.map((item) => item.tag);
		// 修正: createEventParametersForBookmark を使用
		const ev = await createEventParametersForBookmark(selectedBookmark, tagsToSave, isPrivate);
		if (ev) {
			await publishEvent(ev, '削除完了', '削除失敗');
			//originalTags = $state.snapshot(tagsToDisplay);
			//selectedTagIds = new Set();
		}
	}

	//移動
	async function moveSelectedTags(atag: string, isPrv: boolean) {
		if (selectedCount === 0 || !selectedBookmark) {
			toastStore.error({
				title: 'エラー',
				description: '移動するタグが選択されていません。'
			});
			return;
		}

		try {
			// 1. 移動先のブックマークを取得
			const destinationBookmarkMap = get(bookmarkItemsMap);
			const destinationBookmark = destinationBookmarkMap.get(atag);

			if (!destinationBookmark) {
				toastStore.error({
					title: 'エラー',
					description: '移動先のブックマークが見つかりませんでした。'
				});
				return;
			}

			// 2. 移動するタグと、移動元に残すタグを抽出
			const tagsToMove = tagsToDisplay.filter((item) => selectedTagIds.has(item.id));
			const tagsToMoveAsArray = tagsToMove.map((item) => item.tag);
			const remainingTags = tagsToDisplay.filter((item) => !selectedTagIds.has(item.id));
			const remainingTagsAsArray = remainingTags.map((item) => item.tag);

			// 3. 移動先の新しいタグリストを準備
			let destinationTagsToSave: string[][] = [];

			if (isPrv) {
				// 非公開の場合: 既存のcontentがある場合は復号し、tagsToMoveを追加する
				const content = destinationBookmark.event.content;
				if (content) {
					const decryptedContent = await window.nostr?.nip04?.decrypt(
						destinationBookmark.event.pubkey,
						content
					);
					if (!decryptedContent) {
						toastStore.error({
							title: 'エラー',
							description: '既存の非公開タグの復号に失敗しました。'
						});
						return;
					}

					const existingTags = JSON.parse(decryptedContent) as string[][];
					destinationTagsToSave = $state.snapshot([...existingTags, ...tagsToMoveAsArray]);
				} else {
					destinationTagsToSave = $state.snapshot(tagsToMoveAsArray);
				}
			} else {
				// 公開の場合: 既存のtagsにtagsToMoveを追加する
				destinationTagsToSave = $state.snapshot([
					...destinationBookmark.event.tags,
					...tagsToMoveAsArray
				]);
			}

			// 4. 移動先のイベントを作成
			const destinationEventParams = await createEventParametersForBookmark(
				destinationBookmark,
				destinationTagsToSave,
				isPrv
			);
			console.log(destinationEventParams);
			if (!destinationEventParams) {
				toastStore.error({ title: 'エラー', description: '移動先のイベント作成に失敗しました。' });
				return;
			}

			// 5. 移動先のブックマークを更新し、成功したら移動元を更新
			await publishEvent(destinationEventParams, '移動（追加）完了', '移動（追加）失敗');

			// 移動先の更新が成功した場合のみ、移動元の更新に進む
			const sourceEventParams = await createEventParametersForBookmark(
				selectedBookmark,
				remainingTagsAsArray,
				isPrivate
			);
			console.log(sourceEventParams);
			if (sourceEventParams) {
				await publishEvent(sourceEventParams, '移動（削除）完了', '移動（削除）失敗');

				toastStore.success({
					title: '移動完了',
					description: `${selectedCount}個のタグを移動しました。`
				});
			}
		} catch (error) {
			console.error('タグの移動中にエラーが発生しました:', error);
			toastStore.error({ title: 'エラー', description: 'タグの移動に失敗しました。' });
		}
	}

	async function addNewTag(tag: string[]) {
		console.log('新しいタグが追加されました:', tag);

		if (!selectedBookmark) {
			toastStore.error({
				title: 'エラー',
				description: 'ブックマークが選択されていません。'
			});
			return;
		}
		const newTagItem: DndTagItem = {
			id: `${tagsToDisplay.length}`,
			tag,
			originalIndex: tagsToDisplay.length
		};
		const updatedTagsToDisplay = [...tagsToDisplay, newTagItem];
		const tagsToSave = updatedTagsToDisplay.map((item) => item.tag);

		// 修正: createEventParametersForBookmark を使用
		const ev = await createEventParametersForBookmark(selectedBookmark, tagsToSave, isPrivate);
		if (ev) {
			await publishEvent(ev, 'タグ追加完了', 'タグ追加失敗');
		}
	}

	function handleDndConsider(e: CustomEvent<{ items: DndTagItem[] }>) {
		tagsToDisplay = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent<{ items: DndTagItem[] }>) {
		tagsToDisplay = e.detail.items;
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
		// 修正: createEventParametersForBookmark を使用
		const ev = await createEventParametersForBookmark(selectedBookmark, tagsToSave, isPrivate);
		if (ev) {
			await publishEvent(ev, '更新完了', '更新失敗');
		}
	}

	function cancelSorting() {
		tagsToDisplay = [...originalTags];
		isSorting = false;
	}

	async function saveTagEdit(id: string, newTag: string[]) {
		if (!selectedBookmark) return;
		const tagIndex = tagsToDisplay.findIndex((t) => t.id === id);
		if (tagIndex === -1) {
			toastStore.error({ title: 'ERROR', description: 'failed to edit' });
			return;
		}

		const updatedTags = [...tagsToDisplay];
		updatedTags[tagIndex] = { ...updatedTags[tagIndex], tag: newTag };

		const tagsToSave = updatedTags.map((item) => item.tag);
		// 修正: createEventParametersForBookmark を使用
		const ev = await createEventParametersForBookmark(selectedBookmark, tagsToSave, isPrivate);
		if (ev) {
			await publishEvent(ev, '更新完了', '更新失敗');
		}
	}

	async function saveTitle() {
		if (!selectedBookmark) return;

		const tagsToSave = tagsToDisplay.map((item) => item.tag);
		// 修正: createEventParametersForBookmark を使用
		const ev = await createEventParametersForBookmark(selectedBookmark, tagsToSave, isPrivate);
		if (ev) {
			await publishEvent(ev, 'タイトル更新完了', 'タイトル更新失敗');
			editingTitle = false;
		} else {
			toastStore.error({ title: 'ERROR', description: 'failed to edit' });
			editingTitle = false;
		}
	}

	async function saveDescription() {
		if (!selectedBookmark) return;

		const tagsToSave = tagsToDisplay.map((item) => item.tag);
		// 修正: createEventParametersForBookmark を使用
		const ev = await createEventParametersForBookmark(selectedBookmark, tagsToSave, isPrivate);
		if (ev) {
			await publishEvent(ev, '説明更新完了', '説明更新失敗');
			console.log('end');
			editingDescription = false;
		} else {
			toastStore.error({ title: 'ERROR', description: 'failed to edit' });
			editingDescription = false;
		}
	}

	async function saveImage() {
		if (!selectedBookmark) return;

		const tagsToSave = tagsToDisplay.map((item) => item.tag);
		// 修正: createEventParametersForBookmark を使用
		const ev = await createEventParametersForBookmark(selectedBookmark, tagsToSave, isPrivate);
		if (ev) {
			await publishEvent(ev, '画像更新完了', '画像更新失敗');
			editingImage = false;
		} else {
			toastStore.error({ title: 'ERROR', description: 'failed to edit' });
			editingImage = false;
		}
	}

	// createEventParametersは削除し、この関数に一本化します。
	async function createEventParametersForBookmark(
		bookmark: BookmarkItem,
		tagsToSave: string[][],
		isPrivate: boolean
	): Promise<EventParameters | null> {
		if (!bookmark) {
			toastStore.error({ title: 'エラー', description: 'ブックマークが指定されていません。' });
			return null;
		}

		let ev: EventParameters;
		if (isPrivate) {
			try {
				const tagsJson = JSON.stringify(tagsToSave);
				const encryptedContent = await window.nostr?.nip04?.encrypt(
					bookmark.event.pubkey,
					tagsJson
				);
				if (!encryptedContent) {
					toastStore.error({
						title: 'エラー',
						description: 'タグの暗号化に失敗しました。'
					});
					return null;
				}
				ev = {
					kind: bookmark.event.kind,
					created_at: Math.floor(Date.now() / 1000),
					tags: $state.snapshot(bookmark.event.tags), // 元のタグを保持
					content: encryptedContent
				};
			} catch (error) {
				console.error('タグの更新中にエラーが発生しました (非公開):', error);
				toastStore.error({
					title: 'エラー',
					description: 'タグの更新に失敗しました。詳細をコンソールで確認してください。'
				});
				return null;
			}
		} else {
			const newTags: string[][] = [];
			const dTag = bookmark.event.tags.find((tag) => tag[0] === 'd');
			if (dTag) newTags.push(dTag);

			// 公開イベントの場合、タイトル、説明、画像タグをtagsToSaveから抽出し、
			// もし存在すれば追加する。
			if (bookmark.event.kind !== 10003) {
				const titleTag = tagsToSave.find((tag) => tag[0] === 'title');
				if (titleTag) newTags.push(titleTag);

				const descriptionTag = tagsToSave.find((tag) => tag[0] === 'description');
				if (descriptionTag) newTags.push(descriptionTag);

				const imageTag = tagsToSave.find((tag) => tag[0] === 'image');
				if (imageTag) newTags.push(imageTag);
			}

			// 移動/削除対象のタグは tagsToSave に含まれている
			const otherTags = tagsToSave.filter(
				(tag) => !['d', 'title', 'description', 'image'].includes(tag[0])
			);
			newTags.push(...otherTags);

			ev = {
				kind: bookmark.event.kind,
				created_at: Math.floor(Date.now() / 1000),
				tags: $state.snapshot(newTags),
				content: bookmark.event.content
			};
		}
		return ev;
	}
</script>

{#if selectedBookmark}
	<div
		class="mx-auto max-w-4xl overflow-x-hidden rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
	>
		{#if selectedBookmark.event.kind !== 10003}
			<div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-[0.3fr_0.7fr]">
				<div>
					<div
						class="flex h-[240px] w-full items-center justify-center rounded bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
					>
						{#if selectedBookmark.image && selectedBookmark.image.trim() !== ''}
							<img
								loading="lazy"
								src={selectedBookmark.image}
								alt={selectedBookmark.title || ''}
								class="h-[240px] w-full rounded object-cover"
							/>
						{:else}
							<span class="text-lg">画像なし</span>
						{/if}
					</div>
					{#if editable}
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
						{/if}{/if}
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
							{#if editable}
								<button
									onclick={() => (editingTitle = true)}
									class="rounded-md bg-neutral-200 px-3 py-1 text-sm font-medium dark:bg-neutral-700"
									>修正</button
								>{/if}
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
							{#if editable}
								<button
									onclick={() => (editingDescription = true)}
									class="rounded-md bg-neutral-200 px-3 py-1 text-sm font-medium dark:bg-neutral-700"
									>修正</button
								>{/if}
						</div>
					{/if}
				</div>
			</div>
		{/if}
		<div class="mb-6 flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
			<div
				class=" rounded bg-primary-100 px-2 py-1 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
				style="white-space: pre-wrap; word-break: break-word; "
			>
				{selectedBookmark.atag}
			</div>
			{#if selectedBookmark.event.created_at}
				<span
					class="rounded bg-secondary-100 px-2 py-1 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200"
				>
					更新日時: {formatAbsoluteDateFromUnix(selectedBookmark.event.created_at)}
				</span>{/if}
		</div>
		<div class="mb-4 flex items-center justify-between">
			{#if editable}
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
							class="focus-override shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-xl border border-neutral-600 bg-neutral-100 outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1 dark:border-neutral-400 dark:bg-neutral-900"
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
				</Select.Root>{/if}
			<div class="flex flex-wrap items-center justify-center gap-1">
				<button
					class="rounded-md px-3 py-1 text-sm font-medium transition-colors {isPrivate
						? 'bg-neutral-200 dark:bg-neutral-700'
						: 'bg-blue-500 text-white'}"
					onclick={() => (isPrivate = false)}
				>
					公開
				</button>
				<button
					disabled={!editable}
					class="rounded-md px-3 py-1 text-sm font-medium transition-colors {isPrivate
						? 'bg-blue-500 text-white'
						: 'bg-neutral-200 dark:bg-neutral-700'}"
					onclick={() => (isPrivate = true)}
				>
					非公開
				</button>
			</div>
		</div>
		{#if editable}
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
			</div>{/if}
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
						class="my-1 flex items-center rounded-lg border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-800 {isTagSelected(
							item.id
						)
							? 'ring-2 ring-blue-500'
							: ''} {isSorting ? 'cursor-grab' : ''}"
						style="white-space: pre-wrap; word-break: break-word;"
					>
						{#if editable}
							{#if isSorting}
								<span class="handle text-neutral-400">⋮⋮</span>
							{:else}
								<input
									type="checkbox"
									class="form-checkbox m-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
									checked={isTagSelected(item.id)}
									onchange={() => toggleTagSelection(item.id)}
								/>
							{/if}
						{/if}
						<TagRenderer tag={item.tag} />
						{#if editable}
							<ItemMenu
								tag={item.tag}
								onConformEditTag={(editedTag) => saveTagEdit(item.id, editedTag)}
							/>
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

{#if selectedBookmark && editable}
	<div
		class="fixed right-4 bottom-4 z-50 flex items-center space-x-4 rounded-lg bg-neutral-100 p-4 shadow-xl dark:bg-neutral-900"
	>
		<div class="flex items-center space-x-2">
			{#if selectedCount > 0 && !isSorting}
				<span class="text-sm font-bold">
					{selectedCount}個選択中
				</span>
			{/if}
			{#if !isSorting}
				<ConfirmDeleteDialog
					{selectedTags}
					onConfirm={deleteSelectedTags}
					disabled={selectedCount === 0 || isSorting}
				/>
				<MoveTagButton onMoveTo={moveSelectedTags} disabled={selectedCount === 0 || isSorting} />
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
		<CreateNewTag onConformNewTag={addNewTag} />
	</div>
{/if}

<style>
	.cursor-grab {
		cursor: grab;
	}
</style>
