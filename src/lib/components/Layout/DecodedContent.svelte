<script lang="ts">
	import { TokenType, type Token } from '@konemono/nostr-content-parser';
	import { nip19 } from 'nostr-tools';
	import UrlDisplay from './UrlDisplay.svelte';
	import UserName from './UserName.svelte';

	interface Props {
		decoded: nip19.DecodedResult;
		tags?: string[][];
		part: Token;
	}

	let { decoded, tags, part }: Props = $props();
</script>

<!-- 
{content}-->
<div class="inline w-fit overflow-hidden">
	{#if decoded.type === 'npub'}
		<span class="inline-flex w-fit align-middle text-primary-300"
			><UserName pubhex={decoded.data} />
		</span>{:else if decoded.type === 'nprofile'}<span class="w-fit align-middle text-primary-300"
			><UserName pubhex={decoded.data.pubkey} /></span
		>
	{:else}
		<UrlDisplay
			part={{
				type: TokenType.URL,
				content: `https://njump.me/${part.metadata?.plainNip19 || ''}`,
				start: 0,
				end: 0,
				metadata: { text: part.content }
			} as Token}
		/>
		<!-- {:else if decoded.type === "nevent"}
    {@const relayHint = findRelayHint([
      ["e", decoded.data.id],
      ["q", decoded.data.id],
    ])}
    <span class="grid grid-cols-[auto_1fr_auto]">
      <Quote size="14" class="text-primary-500 fill-primary-500/75" />
      <Note
        {...baseNoteProps}
        id={decoded.data.id}
        relayhint={buildRelayHint(relayHint, decoded.data.relays)}
      />
      <Quote size="14" class="text-primary-500 fill-primary-500/75" />
    </span>
  {:else if decoded.type === "note"}
    {@const relayHint = findRelayHint([
      ["e", decoded.data],
      ["q", decoded.data],
    ])}
    <span class="grid grid-cols-[auto_1fr_auto]">
      <Quote size="14" class="text-primary-500 fill-primary-500/75" />
      <Note
        {...baseNoteProps}
        id={decoded.data}
        relayhint={buildRelayHint(relayHint)}
      />
      <Quote size="14" class="text-primary-500 fill-primary-500/75" />
    </span>
  {:else if decoded.type === "naddr"}
    {@const relayHint = getRelayHint([
      "a",
      `${decoded.data.kind}:${decoded.data.pubkey}:${decoded.data.identifier}`,
    ])}
    <span class="grid grid-cols-[auto_1fr_auto]">
      <Quote size="14" class="text-primary-500 fill-primary-500/75" />
      <NaddrEvent
        {...baseNaddrProps}
        data={{
          ...decoded.data,
          relays: buildRelayHint(relayHint, decoded.data.relays),
        }}
      />
      <Quote size="14" class="text-primary-500 fill-primary-500/75" />
    </span>
  {:else if decoded.type === "nsec"}
    {content} -->
	{/if}
</div>
