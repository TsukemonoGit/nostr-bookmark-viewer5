<script lang="ts">
	import { t } from '@konemono/svelte5-i18n';
	import { X } from '@lucide/svelte';
	import { Dialog, Separator } from 'bits-ui';
	import TagRenderer from '../../Bookmark/TagRenderer.svelte';
	import type { DndTagItem } from '$lib/types/utiles';

	let isOpen = $state(false);

	interface Props {
		disabled: boolean;
		onConfirm: () => void;
		selectedTags: DndTagItem[];
	}
	let { disabled, onConfirm, selectedTags }: Props = $props();
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger
		{disabled}
		class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300 dark:disabled:bg-red-700"
	>
		{$t('deleteConfirm.trigger')}
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
				{$t('deleteConfirm.title')}
			</Dialog.Title>
			<Separator.Root class="bg-muted -mx-5 mt-5 mb-6 block h-px" />
			<Dialog.Description class="text-foreground-alt text-sm">
				{$t('deleteConfirm.description', { count: selectedTags.length })}
			</Dialog.Description>
			<div
				class="flex max-h-60 flex-col items-start divide-y divide-neutral-500 overflow-y-auto pt-7 pb-11"
			>
				{#each selectedTags as id}
					<TagRenderer tag={id.tag} />
				{/each}
			</div>
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
