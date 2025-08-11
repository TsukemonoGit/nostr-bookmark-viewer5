<script lang="ts">
	import { TokenType, type Token } from '@konemono/nostr-content-parser';
	import UrlDisplay from '../Layout/UrlDisplay.svelte';
	import NaddrEvent from '../Tags/NaddrEvent.svelte';
	import NoteEvent from '../Tags/NoteEvent.svelte';
	import Relay from '../Tags/Relay.svelte';
	import { viewport } from '$lib/utils/useViewportAction';

	let hasLoaded = $state(false);
	let { tag, setRelayHint } = $props<{ tag: string[]; setRelayHint?: (relay: string) => void }>();

	const handleEnterViewport = () => {
		//console.log('in,', noteId);
		if (!hasLoaded) {
			hasLoaded = true;
		}
	};
</script>

<div class="w-full flex-1" use:viewport={null} onenterViewport={handleEnterViewport}>
	{#if hasLoaded}
		{#if tag[0] === 'e'}
			<NoteEvent {tag} {setRelayHint} />
		{:else if tag[0] === 'a'}
			<NaddrEvent {tag} {setRelayHint} />
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
		{/if}{:else}
		<div class="text-sm text-neutral-600 dark:text-neutral-400">
			{JSON.stringify(tag)}
		</div>
	{/if}
</div>
