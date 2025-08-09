<script lang="ts">
	import type { CreateData } from '$lib/types/utiles';
	import { toastStore } from '$lib/utils/util';
	import { Plus, X } from '@lucide/svelte';
	import { Dialog, Separator } from 'bits-ui';

	let isOpen = $state(false);

	interface Props {
		onConfirm: (formdata: CreateData) => void;
	}
	let { onConfirm }: Props = $props();

	let formdata = $state({
		d: new Date()
			.toISOString()
			.slice(0, 19)
			.replace(/[^0-9]/g, ''),
		title: '',
		image: '',
		description: ''
	});

	function handleFormSubmit(e: { preventDefault: () => void }) {
		e.preventDefault();
		if (!formdata.d || !/^[a-zA-Z0-9_-]+$/.test(formdata.d)) {
			// alertの代わりにtoastStore.errorを使用
			toastStore.warning({
				title: 'WARNING',
				description:
					'IDは必須入力で、アルファベット、数字、ハイフン、アンダースコアのみ使用可能です。',
				duration: 10000
			});
			return;
		}

		isOpen = false;
		onConfirm(formdata);

		formdata = {
			d: new Date()
				.toISOString()
				.slice(0, 19)
				.replace(/[^0-9]/g, ''),
			title: '',
			image: '',
			description: ''
		};
	}
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger class="mb-2 btn flex w-full items-center gap-1 rounded-md   preset-tonal-primary">
		<Plus size="20" />Create New
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
				Create New Bookmark List
			</Dialog.Title>
			<Separator.Root class="bg-muted -mx-5 mt-5 mb-6 block h-px" />
			<Dialog.Description class="text-foreground-alt text-sm">
				id(d tag)（必須）、タイトル(title)、画像(image)、説明(description)を入力してください。
				idはアルファベット、数字、ハイフン、アンダースコアのみ使用可能です。
			</Dialog.Description>

			<form onsubmit={handleFormSubmit} class="mt-4 space-y-4">
				<div>
					<label
						for="d-tag"
						class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
						>ID (d tag)</label
					>
					<input
						id="d-tag"
						type="text"
						bind:value={formdata.d}
						class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
					/>
				</div>
				<div>
					<label
						for="title"
						class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Title</label
					>
					<input
						id="title"
						type="text"
						bind:value={formdata.title}
						class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
					/>
				</div>
				<div>
					<label
						for="image"
						class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
						>Image URL</label
					>
					<input
						id="image"
						type="text"
						bind:value={formdata.image}
						class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
					/>
				</div>
				<div>
					<label
						for="description"
						class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
						>Description</label
					>
					<textarea
						id="description"
						bind:value={formdata.description}
						rows="3"
						class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
					></textarea>
				</div>
				<button
					type="submit"
					class="h-input rounded-input shadow-mini focus-visible:ring-offset-background inline-flex w-full items-center justify-center bg-blue-600 px-[50px] text-[15px] font-semibold text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-[0.98]"
				>
					作成
				</button>
			</form>

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
