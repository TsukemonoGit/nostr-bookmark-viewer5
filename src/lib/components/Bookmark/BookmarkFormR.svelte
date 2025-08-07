<script lang="ts">
	interface Props {
		onSubmit: (data: string[]) => void;
	}
	let { onSubmit }: Props = $props();

	let url = $state('');
	let title = $state('');

	function handleSubmit() {
		const formData = ['r', url, title].filter(Boolean);
		onSubmit(formData);
	}
</script>

<div class="space-y-4">
	<div>
		<label for="url" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
			URL
		</label>
		<input
			id="url"
			type="url"
			bind:value={url}
			placeholder="https://example.com"
			class="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
		/>
	</div>

	<div>
		<label for="title" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
			タイトル（オプション）
		</label>
		<input
			id="title"
			type="text"
			bind:value={title}
			placeholder="ブックマークのタイトル"
			class="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
		/>
	</div>
</div>
<div class="mt-1 flex w-full justify-end">
	<button
		onclick={() => {
			handleSubmit();
		}}
		class="h-input rounded-input shadow-mini focus-visible:ring-offset-background inline-flex items-center justify-center bg-red-600 px-[50px] text-[15px] font-semibold text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-[0.98]"
	>
		追加
	</button>
</div>
