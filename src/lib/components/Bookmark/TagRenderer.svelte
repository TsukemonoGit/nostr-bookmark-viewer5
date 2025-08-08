<script lang="ts">
	import { TokenType, type Token } from '@konemono/nostr-content-parser';
	import UrlDisplay from '../Layout/UrlDisplay.svelte';
	import NaddrEvent from '../Tags/NaddrEvent.svelte';
	import NoteEvent from '../Tags/NoteEvent.svelte';
	import Relay from '../Tags/Relay.svelte';

	let { tag }: { tag: string[] } = $props();
</script>

<div class="flex-1 p-1">
	{#if tag[0] === 'e'}
		<NoteEvent {tag} />
	{:else if tag[0] === 'a'}
		<NaddrEvent {tag} />
	{:else if tag[0] === 'r'}
		{#if tag[1]?.startsWith('ws')}
			<Relay {tag} />
		{:else}
			<div>
				{#if tag[2]}
					<p class="text-lg font-bold">{tag[2]}</p>{/if}<UrlDisplay
					part={{
						type: TokenType.URL,
						content: tag[1],
						start: 0,
						end: 0
					} as Token}
				/>
			</div>
		{/if}
	{:else if tag[0] === 't'}
		#{tag[1]}
	{:else}
		<div class="text-sm text-neutral-600 dark:text-neutral-400">
			{JSON.stringify(tag)}
		</div>
	{/if}
</div>
