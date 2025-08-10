<script lang="ts">
	import { ExternalLink, FileJson, Menu, Pencil, Share } from '@lucide/svelte';
	import { DropdownMenu } from 'bits-ui';
	import TagEditor from '../Bookmark/TagEditor.svelte';
	import { type QueryKey } from '@tanstack/svelte-query';
	import { type Event as NostrEvent } from 'nostr-typedef';
	import JsonView from './JsonView.svelte';
	import { nostrShare, queryClient, shareText } from '$lib/utils/stores.svelte';
	import { encodetoNaddr, encodetoNevent } from '$lib/utils/encode';
	import type { EventPacket } from 'rx-nostr';

	// MenubarからDropdownMenuに変更
	interface Props {
		tag: string[];
		onConformEditTag: (tag: string[]) => void;
		editable: boolean;
	}
	let { tag, onConformEditTag, editable }: Props = $props();
	let openTagEditor = $state(false);
	let openJsonView = $state(false);
	let menuItem = $derived([
		...(editable ? [{ id: 'edit', label: 'Edit', Icon: Pencil }] : []),
		{ id: 'json', label: 'View Json', Icon: FileJson },
		...(tag[0] === 'a' || tag[0] === 'e'
			? [{ id: 'njump', label: 'Open in njump', Icon: ExternalLink }]
			: []),
		...(tag[0] === 'a' || tag[0] === 'e' ? [{ id: 'share', label: 'Share', Icon: Share }] : [])
	]);
	let event: NostrEvent | null = $state(null);

	function onSelect(e: any) {
		console.log(e, e.id === 'json');

		if (e.id === 'edit') {
			//console.log('編集モードをアクティブにします');
			openTagEditor = true;
		} else if (e.id === 'json') {
			try {
				const packet = queryClient.get()?.getQueryData([tag[1]] as QueryKey) as EventPacket | null;
				if (packet) {
					event = packet.event;
				}
			} catch (error) {
				console.log(error);
			}
			openJsonView = true;
			//console.log('JSONビューを表示します', openJsonView, event);
		} else if (e.id === 'njump') {
			console.log('njumpで開きます');
			const link =
				tag[0] === 'e'
					? encodetoNevent({ id: tag[1], author: event?.pubkey, kind: event?.kind })
					: encodetoNaddr(tag[1]);
			console.log(link);
			window.open(`https://njump.me/${link}`, '_blank', 'noopener,noreferrer');
		} else if (e.id === 'share') {
			// nostr-shareをクリック
			const share = nostrShare.get();
			console.log(share);
			if (share) {
				const link =
					tag[0] === 'e'
						? encodetoNevent({ id: tag[1], author: event?.pubkey, kind: event?.kind })
						: encodetoNaddr(tag[1]);

				shareText.set(`nostr:${link}`);

				// Shadow DOM内のボタンを取得してクリック
				const shadowRoot = share.shadowRoot;
				if (shadowRoot) {
					const button = shadowRoot.querySelector('button[part="button"]') as HTMLButtonElement;
					if (button) {
						button.click();
					}
				}
			}
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class="flex items-center rounded-md bg-neutral-200 p-1 text-sm font-medium hover:bg-neutral-300 dark:bg-neutral-700 hover:dark:bg-neutral-600"
	>
		<Menu />
	</DropdownMenu.Trigger>
	<DropdownMenu.Portal>
		<DropdownMenu.Content
			class="focus-override shadow-popover z-50 w-full max-w-[220px] rounded-xl border bg-neutral-200 px-1 py-1.5 focus-visible:outline-hidden dark:bg-neutral-800"
			align="start"
			sideOffset={3}
		>
			<DropdownMenu.Separator />
			{#each menuItem as menu}
				<DropdownMenu.Item
					class="data-highlighted:bg-muted flex h-10 items-center rounded-md py-3 pr-1.5 pl-3 text-sm font-medium select-none hover:bg-neutral-300 focus-visible:outline-none dark:hover:bg-neutral-600"
					onclick={() => onSelect(menu)}
				>
					<menu.Icon class="mr-1" size="20" />{menu.label}
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
<TagEditor bind:isOpen={openTagEditor} initTag={tag} {onConformEditTag} />
<JsonView {event} {tag} bind:isOpen={openJsonView} />

<TagEditor bind:isOpen={openTagEditor} initTag={tag} {onConformEditTag} />
<JsonView {event} {tag} bind:isOpen={openJsonView} />
