<script lang="ts">
	import type { Token } from '@konemono/nostr-content-parser';
	import UrlType from './UrlType.svelte';
	import Link from './Link.svelte';
	import ContentImage from './ContentImage.svelte';
	import OgpLoad from './OgpLoad.svelte';
	import ContentVideo from './ContentVideo.svelte';

	interface Props {
		part: Token;
	}
	let { part }: Props = $props();
</script>

{#if part.content}
	<UrlType url={part.content}>
		{#snippet loading()}
			<Link
				class=" link break-all text-primary-300 underline hover:opacity-80"
				href={part.content ?? ''}>{part.metadata?.text || part.content}</Link
			>
		{/snippet}
		{#snippet content(type)}
			{#if type === 'image' || type === 'svg'}
				<ContentImage url={part.content} />
			{:else if type === 'movie'}
				<ContentVideo url={part.content} />
			{:else if type === 'audio'}
				<audio
					aria-label="audio contents"
					controls
					src={part.content}
					class=" max-h-80 max-w-[min(20rem,100%)] object-contain"
					><track default kind="captions" /></audio
				>
				<!--{:else if type === '3D'}
				<Content3D content={part.content} url={part.content} />-->
			{:else if type === 'url'}
				<OgpLoad url={part.content || ''} text={part.metadata?.text || part.content} />{:else}
				<span class="break-words whitespace-pre-wrap" style="word-break: break-word;"
					>{part.metadata?.text || part.content}</span
				>
			{/if}
		{/snippet}
	</UrlType>
{/if}
