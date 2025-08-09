<script lang="ts">
	import { t } from '@konemono/svelte5-i18n';
	import { Trash2, X } from '@lucide/svelte';
	import { Dialog, Separator } from 'bits-ui';

	import type { BookmarkItem } from '$lib/types/bookmark.svelte';
	let isOpen = $state(false);

	interface Props {
		disabled?: boolean;
		onConfirm: () => void;
		item: BookmarkItem;
	}
	let { disabled = false, onConfirm, item }: Props = $props();
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger
		{disabled}
		class="rounded p-1 text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500 hover:text-white"
		aria-label={$t('common.delete')}
	>
		<Trash2 size="16" />
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
				{$t('deleteItem.title')}
			</Dialog.Title>
			<Separator.Root class="bg-muted -mx-5 mt-5 mb-6 block h-px" />
			<Dialog.Description class="text-foreground-alt text-sm">
				{$t('deleteItem.description', { name: item.title || item.identifier || item.event.kind })}
			</Dialog.Description>

			<div class="mt-1 flex w-full justify-end">
				<button
					onclick={() => {
						onConfirm();
						isOpen = false;
					}}
					class="h-input rounded-input shadow-mini focus-visible:ring-offset-background inline-flex items-center justify-center bg-red-600 px-[50px] text-[15px] font-semibold text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-[0.98]"
				>
					{$t('common.delete')}
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
