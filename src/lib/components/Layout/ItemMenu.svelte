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
	import { getRelaysById } from '$lib/nostr/nostrSubscriptions';

	// MenubarからDropdownMenuに変更
	interface Props {
		tag: string[];
		onConformEditTag: (tag: string[]) => void;
		editable: boolean;
		event?: NostrEvent | null;
	}
	let { tag, onConformEditTag, editable, event = $bindable(null) }: Props = $props();
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

	// 使用例のonSelect関数も更新
	function onSelect(e: any) {
		const packet = queryClient.get()?.getQueryData([tag[1]] as QueryKey) as EventPacket | null;
		if (packet) {
			event = packet.event;
		}
		const seenOn: string[] = packet ? getRelaysById(packet.event.id) : [];

		// リンク生成を共通化（更新されたエンコード関数を使用）
		const generateLink = () => {
			return tag[0] === 'e'
				? encodetoNevent({
						id: tag[1],
						author: event?.pubkey,
						kind: event?.kind,
						...(seenOn.length > 0 ? { relays: seenOn } : {})
					})
				: encodetoNaddr(tag[1], seenOn);
		};

		if (e.id === 'edit') {
			openTagEditor = true;
		} else if (e.id === 'json') {
			try {
			} catch (error) {
				console.log(error);
			}
			openJsonView = true;
		} else if (e.id === 'njump') {
			console.log('njumpで開きます');
			const link = generateLink();
			console.log(link);
			window.open(`https://njump.me/${link}`, '_blank', 'noopener,noreferrer');
		} else if (e.id === 'share') {
			const share = nostrShare.get();
			if (share) {
				const link = generateLink();
				shareText.set(`nostr:${link}`);

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
