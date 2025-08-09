<script lang="ts">
	import * as Nostr from 'nostr-typedef';
	import { type Ogp } from '$lib/utils/ogp';
	import { type Event as NostrEvent } from 'nostr-typedef';
	import { isReplaceableKind, isAddressableKind } from 'nostr-tools/kinds';
	import OgpCard from './OgpCard.svelte';
	import { nip19 } from 'nostr-tools';

	interface Props {
		event: Partial<Nostr.Event>;
	}

	let { event }: Props = $props();
	let dtag = $derived(event.tags?.find((tag) => tag[0] === 'd')?.[1]);
	let contents: Ogp = $derived.by(() => {
		return {
			title:
				event.tags?.find((tag) => tag[0] === 'title')?.[1] || dtag || event.kind?.toString() || '',
			image: event.tags?.find((tag) => tag[0] === 'image')?.[1] || '',
			description:
				event.tags?.find((tag) => tag[0] === 'description' || tag[0] === 'summary')?.[1] || '',
			favicon: '',
			memo: event.kind?.toString()
		};
	});

	let url: string = $derived(createUrl(event));

	function createUrl(event: Partial<Nostr.Event<number>>) {
		const encodedId = encodeId(event);
		if (event) {
			return `https://njump.me/${encodedId}`;
		} else {
			return '';
		}
	}

	function encodeId(event: Partial<Nostr.Event<number>>): string | null {
		const pubkey = event.pubkey;
		const kind = event.kind;

		if (!pubkey || !kind) {
			return null;
		}

		if (isReplaceableKind(kind) || isAddressableKind(kind)) {
			try {
				return nip19.naddrEncode({ kind: kind, pubkey: pubkey, identifier: dtag || '' });
			} catch (error) {
				return null;
			}
		} else {
			try {
				return nip19.neventEncode({ kind: kind, author: pubkey, id: event.id || '' });
			} catch (error) {
				return null;
			}
		}
	}
</script>

<OgpCard {contents} {url}></OgpCard>
