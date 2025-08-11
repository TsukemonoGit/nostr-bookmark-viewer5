<script lang="ts">
	import { Plus, X } from '@lucide/svelte';
	import { Dialog, Separator, Tabs } from 'bits-ui';

	import BookmarkFormE from '../../Bookmark/BookmarkFormE.svelte';
	import BookmarkFormA from '../../Bookmark/BookmarkFormA.svelte';
	import BookmarkFormT from '../../Bookmark/BookmarkFormT.svelte';
	import BookmarkFormR from '../../Bookmark/BookmarkFormR.svelte';

	let isOpen = $state(false);

	interface Props {
		onConformNewTag: (tag: string[]) => void;
	}
	let { onConformNewTag }: Props = $props();

	let currentTab = $state('e');

	const tabItems = [
		{ value: 'e', label: 'Event' },
		{ value: 'a', label: 'Article' },
		{ value: 't', label: 'Hashtag' },
		{ value: 'r', label: 'Ref' }
	];

	function handleFormSubmit(formData: string[]) {
		isOpen = false;
		onConformNewTag($state.snapshot(formData));
	}
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger class="btn-icon preset-filled-primary-500 ">
		<Plus />
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
				Create New Bookmark
			</Dialog.Title>
			<Separator.Root class="bg-muted -mx-5 mt-5 mb-6 block h-px" />
			<Dialog.Description class="text-foreground-alt text-sm">
				ブックマークの種類を選択してください：E（イベント）、A（アドレス可能）、T（ハッシュタグ）、R（URL）
			</Dialog.Description>

			<div class="pt-7 pb-11">
				<Tabs.Root bind:value={currentTab} class="w-full">
					<Tabs.List
						class="grid w-full grid-cols-4 rounded-md bg-neutral-200 p-1 dark:bg-neutral-800"
					>
						{#each tabItems as tab}
							<Tabs.Trigger
								value={tab.value}
								class="rounded-sm px-3 py-2 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-700"
							>
								{tab.label}
							</Tabs.Trigger>
						{/each}
					</Tabs.List>

					<div class="mt-4 max-h-60 overflow-y-auto">
						<Tabs.Content value="e" class="mt-4">
							<BookmarkFormE onSubmit={handleFormSubmit} />
						</Tabs.Content>
						<Tabs.Content value="a" class="mt-4">
							<BookmarkFormA onSubmit={handleFormSubmit} />
						</Tabs.Content>
						<Tabs.Content value="t" class="mt-4">
							<BookmarkFormT onSubmit={handleFormSubmit} />
						</Tabs.Content>
						<Tabs.Content value="r" class="mt-4">
							<BookmarkFormR onSubmit={handleFormSubmit} />
						</Tabs.Content>
					</div>
				</Tabs.Root>
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
