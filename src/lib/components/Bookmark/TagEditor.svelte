<script lang="ts">
	import { X } from '@lucide/svelte';
	import { Dialog, Separator } from 'bits-ui';

	import BookmarkFormE from './BookmarkFormE.svelte';
	import BookmarkFormA from './BookmarkFormA.svelte';
	import BookmarkFormT from './BookmarkFormT.svelte';
	import BookmarkFormR from './BookmarkFormR.svelte';

	let isOpen = $state(false);

	interface Props {
		initTag: string[];
		onConformEditTag: (tag: string[]) => void;
	}
	let { initTag, onConformEditTag }: Props = $props();

	// initTagの最初の要素からフォームコンポーネントを決定
	const FormComponent = (() => {
		const tag = initTag[0];
		switch (tag) {
			case 'e':
				return BookmarkFormE;
			case 'a':
				return BookmarkFormA;
			case 't':
				return BookmarkFormT;
			case 'r':
				return BookmarkFormR;
			default:
				return null;
		}
	})();

	function handleFormSubmit(formData: string[]) {
		isOpen = false;
		onConformEditTag($state.snapshot(formData));
	}
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger
		class="rounded-md bg-neutral-200 px-3 py-1 text-sm font-medium dark:bg-neutral-700"
	>
		修正
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
				Edit Bookmark
			</Dialog.Title>
			<Separator.Root class="bg-muted -mx-5 mt-5 mb-6 block h-px" />
			<Dialog.Description class="text-foreground-alt text-sm">
				ブックマークのタグを編集
			</Dialog.Description>

			<div class="pt-7 pb-11">
				{#if FormComponent}
					<FormComponent onSubmit={handleFormSubmit} initialTag={initTag} />
				{:else}
					<p>適切なフォームがありません。</p>
				{/if}
			</div>

			<Dialog.Close
				class="focus-visible:ring-foreground focus-visible:ring-offset-background absolute top-5 right-5 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-[0.98]"
			>
				<div>
					<X class="text-foreground size-5" />
					<span class="sr-only">Close</span>
				</div>
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
