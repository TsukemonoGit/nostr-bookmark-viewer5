<script lang="ts">
	import * as Nostr from 'nostr-typedef';
	import Kind1 from './Kind1.svelte';

	interface Props {
		event: Nostr.Event;
		metadata?: Nostr.Event | undefined;
	}

	let { event, metadata }: Props = $props();
</script>

{#if event}
	{#if event.kind === 1}
		<Kind1 {event} {metadata} />
	{:else}
		<!---->
	{/if}
{/if}
