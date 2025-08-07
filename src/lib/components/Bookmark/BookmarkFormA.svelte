<script lang="ts">
	import { encodetoNaddr } from '$lib/utils/encode';
	import { nip33Regex } from '$lib/utils/regex';
	import { toastStore } from '$lib/utils/util';
	import { nip19 } from 'nostr-tools';

	interface Props {
		onSubmit: (data: string[]) => void;
		// 新しく追加したprops
		initialTag?: string[];
	}

	// propsの初期値を設定
	let { onSubmit, initialTag }: Props = $props();

	// $state変数をpropsの初期値で設定
	let addressableId = $state(encodetoNaddr(initialTag?.[1]) || '');
	let relay = $state(initialTag?.[2] || '');

	function handleSubmit() {
		const checkedId = checkId(addressableId.trim());
		if (!checkedId) {
			toastStore.error({ title: 'ERROR', description: 'invalid id' });
			return;
		}
		const formData = ['a', addressableId, relay].filter(Boolean);
		onSubmit(formData);
	}

	function checkId(eventId: string): string | null {
		//先頭にnostr:がついていたら削除
		const id = eventId.startsWith('nostr:') ? eventId.substring(6) : eventId;
		//naddrで始まる場合はでコードチャレンジ
		//nip33Regex.test()で合格したら追加可能
		try {
			if (id.startsWith('naddr1')) {
				const decoded = nip19.decode(id);
				if (!decoded) return null;
				if (decoded.type === 'naddr') {
					const data = decoded.data;
					return `${data.kind}:${data.pubkey}:${data.identifier}`;
				} else {
					return null;
				}
			}
		} catch (error) {
			return null;
		}
		if (nip33Regex.test(id)) {
			return id;
		}
		return null;
	}
</script>

<div class="space-y-4">
	<div>
		<label
			for="addressableId"
			class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
		>
			Addressable ID / Naddr
		</label>
		<input
			id="addressableId"
			type="text"
			bind:value={addressableId}
			placeholder="kind:pubkey:d-tag 形式、またはnaddr1～"
			class="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
		/>
	</div>

	<div>
		<label for="relay" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
			Relay URL（オプション）
		</label>
		<input
			id="relay"
			type="url"
			bind:value={relay}
			placeholder="wss://relay.example.com"
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
