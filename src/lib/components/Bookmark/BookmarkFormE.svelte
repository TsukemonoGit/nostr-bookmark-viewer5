<script lang="ts">
	import { hexRegex } from '$lib/utils/regex';
	import { toastStore } from '$lib/utils/util';
	import { nip19 } from 'nostr-tools';
	import { encodetoNote } from '$lib/utils/encode';
	import { t } from '@konemono/svelte5-i18n';

	interface Props {
		onSubmit: (data: string[]) => void;

		initialTag?: string[];
	}

	// propsの初期値を設定
	let { onSubmit, initialTag }: Props = $props();

	// $state変数をpropsの初期値で設定
	let eventId = $state(encodetoNote(initialTag?.[1]) || '');
	let relay = $state(initialTag?.[2] || '');

	function handleSubmit() {
		const id = checkId(eventId.trim());
		if (!id) {
			toastStore.error({
				title: $t('bookmark.error'),
				description: $t('eventForm.errors.invalidId')
			});
			return;
		}
		const formData = ['e', id, relay].filter(Boolean);
		onSubmit(formData);
	}

	function checkId(eventId: string): string | null {
		const id = eventId.startsWith('nostr:') ? eventId.substring(6) : eventId;
		try {
			if (id.startsWith('note1') || id.startsWith('nevent1')) {
				const decoded = nip19.decode(id);
				if (!decoded) return null;
				if (decoded.type === 'note') {
					return decoded.data;
				} else if (decoded.type === 'nevent') {
					return decoded.data.id;
				}
			}
		} catch (error) {
			return null;
		}
		if (hexRegex.test(id)) {
			return id;
		}
		return null;
	}
</script>

<div class="space-y-4">
	<div>
		<label for="eventId" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
			{$t('eventForm.eventIdLabel')}
		</label>
		<input
			id="eventId"
			type="text"
			bind:value={eventId}
			placeholder={$t('eventForm.eventIdPlaceholder')}
			class="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
		/>
	</div>

	<div>
		<label for="relay" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
			{$t('eventForm.relayLabel')}
		</label>
		<input
			id="relay"
			type="url"
			bind:value={relay}
			placeholder={$t('eventForm.relayPlaceholder')}
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
		{$t('eventForm.submit')}
	</button>
</div>
