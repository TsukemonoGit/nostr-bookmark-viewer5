<script lang="ts">
	import Hashtag from '../Tags/Hashtag.svelte';
	import NaddrEvent from '../Tags/NaddrEvent.svelte';
	import NoteEvent from '../Tags/NoteEvent.svelte';
	import Relay from '../Tags/Relay.svelte';
	import Url from '../Tags/Url.svelte';

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
			<Url {tag} />
		{/if}
	{:else if tag[0] === 't'}
		<Hashtag {tag} />
	{:else}
		<div class="text-sm text-neutral-600 dark:text-neutral-400">
			{JSON.stringify(tag)}
		</div>
	{/if}
</div>
