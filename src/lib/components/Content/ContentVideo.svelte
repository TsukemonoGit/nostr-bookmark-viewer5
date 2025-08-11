<script lang="ts">
	import Link from '../Layout/Link.svelte';

	let videoError: boolean = $state(false);
	let videoLoad: boolean = $state(false);

	interface Props {
		url?: string | undefined;
	}

	let { url = undefined }: Props = $props();
</script>

{#if !videoError}
	{#if !videoLoad}
		<Link class=" link break-all text-primary-300 underline hover:opacity-80" href={url ?? ''}
			>{url}</Link
		>
	{/if}
	<div>
		<video
			aria-label="video contents"
			width="288"
			height="200"
			class="max-h-[18rem] max-w-[min(18rem,100%)] overflow-hidden object-contain"
			src={url}
			controls
			preload="metadata"
			onloadeddata={() => (videoLoad = true)}
			onerror={() => (videoError = true)}
			><track default kind="captions" />
			Sorry, your browser doesn't support embedded videos.
		</video>
	</div>
{:else}
	<Link class=" link break-all text-primary-300 underline hover:opacity-80" href={url ?? ''}
		>{url}</Link
	>
{/if}
