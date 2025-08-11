<script lang="ts">
	import { displayShortPub } from '$lib/utils/util';

	import * as Nostr from 'nostr-typedef';
	import Metadata from '../Nostr/Metadata.svelte';
	import DisplayName from './DisplayName.svelte';

	interface Props {
		pubhex: string;
		relays?: string[];
	}

	let { pubhex, relays }: Props = $props();

	let pubString = $derived(displayShortPub(pubhex));

	const userName = (metadata: Nostr.Event) => {
		const usrProfile = profile(metadata);

		if (!usrProfile) return pubString;

		if (usrProfile.display_name && usrProfile.display_name !== '') {
			return usrProfile.display_name;
		} else if (usrProfile.name && usrProfile.name !== '') {
			return usrProfile.name;
		}

		return pubString;
	};

	function profile(metadata: Nostr.Event) {
		if (!metadata) return undefined;
		try {
			return JSON.parse(metadata.content);
		} catch (e) {
			return undefined;
		}
	}
</script>

<Metadata pubkey={pubhex} {relays}>
	{#snippet loading()}
		<span class="inline-flex text-sm break-all">@{pubString}</span>{/snippet}
	{#snippet nodata()}
		<span class="inline-flex text-sm break-all">@{pubString}</span>
	{/snippet}
	{#snippet error()}
		<span class="inline-flex text-sm break-all">@{pubString}</span>
	{/snippet}
	{#snippet content({ metadata })}<DisplayName
			height={21}
			name={`@${userName(metadata)}`}
			tags={metadata.tags}
		/>{/snippet}
</Metadata>
