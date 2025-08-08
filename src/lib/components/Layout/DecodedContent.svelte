<script lang="ts">
	import { nip19 } from 'nostr-tools';

	interface Props {
		content: string | undefined;

		decoded: nip19.DecodedResult;
		tags?: string[][];
	}

	let { content, decoded, tags }: Props = $props();

	const getRelayHint = (tag: string[]) => {
		return tags?.find((t) => t[0] === tag[0] && t[1] === tag[1])?.[2];
	};

	// 複数のタグからリレーヒントを検索
	const findRelayHint = (searchTags: string[][]) => {
		for (const tag of searchTags) {
			const hint = getRelayHint(tag);
			if (hint) return hint;
		}
		return undefined;
	};

	// relayhintの構築
	const buildRelayHint = (relayHint: string | undefined, existingRelays?: string[]) => {
		return relayHint && relayHint !== '' ? [relayHint, ...(existingRelays || [])] : existingRelays;
	};
</script>

{content}<!-- 
<div class="inline overflow-hidden">
  {#if decoded.type === "npub"}
    <span class="text-magnum-300 align-middle">
      {#if displayMenu}
        <PopupUserName pubkey={decoded.data} {zIndex} />
      {:else}
        <UserName pubhex={decoded.data} />
      {/if}
    </span>
  {:else if decoded.type === "nprofile"}
    <span class="text-magnum-300 align-middle">
      {#if displayMenu}
        <PopupUserName pubkey={decoded.data.pubkey} {zIndex} />
      {:else}
        <UserName pubhex={decoded.data.pubkey} />
      {/if}
    </span>
  {:else if decoded.type === "nevent"}
    {@const relayHint = findRelayHint([
      ["e", decoded.data.id],
      ["q", decoded.data.id],
    ])}
    <span class="grid grid-cols-[auto_1fr_auto]">
      <Quote size="14" class="text-magnum-500 fill-magnum-500/75" />
      <Note
        {...baseNoteProps}
        id={decoded.data.id}
        relayhint={buildRelayHint(relayHint, decoded.data.relays)}
      />
      <Quote size="14" class="text-magnum-500 fill-magnum-500/75" />
    </span>
  {:else if decoded.type === "note"}
    {@const relayHint = findRelayHint([
      ["e", decoded.data],
      ["q", decoded.data],
    ])}
    <span class="grid grid-cols-[auto_1fr_auto]">
      <Quote size="14" class="text-magnum-500 fill-magnum-500/75" />
      <Note
        {...baseNoteProps}
        id={decoded.data}
        relayhint={buildRelayHint(relayHint)}
      />
      <Quote size="14" class="text-magnum-500 fill-magnum-500/75" />
    </span>
  {:else if decoded.type === "naddr"}
    {@const relayHint = getRelayHint([
      "a",
      `${decoded.data.kind}:${decoded.data.pubkey}:${decoded.data.identifier}`,
    ])}
    <span class="grid grid-cols-[auto_1fr_auto]">
      <Quote size="14" class="text-magnum-500 fill-magnum-500/75" />
      <NaddrEvent
        {...baseNaddrProps}
        data={{
          ...decoded.data,
          relays: buildRelayHint(relayHint, decoded.data.relays),
        }}
      />
      <Quote size="14" class="text-magnum-500 fill-magnum-500/75" />
    </span>
  {:else if decoded.type === "nsec"}
    {content}
  {/if}
</div>
 -->
