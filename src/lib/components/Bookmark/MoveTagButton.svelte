<script lang="ts">
	import { LockKeyhole, X } from '@lucide/svelte';
	import { Dialog, Separator } from 'bits-ui';
	import { bookmarkItemsMap } from '$lib/types/bookmark.svelte';
	import { t } from '@konemono/svelte5-i18n';

	let isOpen = $state(false);

	interface Props {
		onMoveTo: (atag: string, isPrivate: boolean) => void;
		disabled: boolean;
	}
	let { onMoveTo, disabled }: Props = $props();

	let selectedListId = $state<string | null>(null);

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

	function handleMove(isPrivate: boolean) {
		if (selectedListId) {
			isOpen = false;
			onMoveTo(selectedListId, isPrivate);
		}
	}
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger
		{disabled}
		class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 dark:disabled:bg-blue-700"
	>
		{$t('moveBookmark.trigger')}
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
		/>
		<Dialog.Content
			class="rounded-card-lg shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border bg-neutral-100 p-5 outline-hidden sm:max-w-[490px] md:w-full dark:bg-neutral-900"
		>
			<Dialog.Title
				class="flex w-full items-center justify-center text-lg font-semibold tracking-tight"
			>
				{$t('moveBookmark.title')}
			</Dialog.Title>
			<Separator.Root class="bg-muted -mx-5 mt-5 mb-6 block h-px" />
			<Dialog.Description class="text-foreground-alt text-sm"></Dialog.Description>
			<div class="max-h-[min(24em,80vh)] overflow-y-auto">
				{#each Object.entries(items) as [key, store]}
					<h2 class="mb-2 text-2xl font-bold text-neutral-600 dark:text-neutral-400">
						{$t(`moveBookmark.sections.${key}`)}
					</h2>
					<ul class="space-y-1">
						{#each store as item}
							<li class="group flex items-center justify-between">
								<button
									onclick={() => (selectedListId = item.atag)}
									class="flex-1 rounded px-2 py-1 text-left transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800"
									class:selected={selectedListId === item.atag}
								>
									{item.title || item.identifier || item.event.kind}
								</button>
							</li>
						{/each}
					</ul>
				{/each}
			</div>
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					onclick={() => handleMove(false)}
					disabled={disabled || !selectedListId}
					class="btn preset-filled-primary-500"
				>
					{$t('moveBookmark.public')}
				</button>
				<button
					type="button"
					onclick={() => handleMove(true)}
					disabled={disabled || !selectedListId}
					class="btn flex items-center gap-1 preset-filled-secondary-500"
				>
					<LockKeyhole />{$t('moveBookmark.private')}
				</button>
			</div>
			<Dialog.Close
				class="focus-visible:ring-foreground focus-visible:ring-offset-background absolute top-5 right-5 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-[0.98]"
			>
				<div>
					<X class="text-foreground size-5" />
					<span class="sr-only">{$t('common.close')}</span>
				</div>
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style lang="postcss">
	@reference "tailwindcss";
	button.selected {
		@apply bg-neutral-300 font-semibold dark:bg-neutral-700;
	}
</style>
