<script lang="ts">
	import { isvalidURL, type Ogp } from '$lib/utils/ogp';
	import LinkCheck from './LinkCheck.svelte';

	interface Props {
		contents: Ogp;
		url: string;
	}

	let { contents, url }: Props = $props();

	let imageURL = $state(isvalidURL(contents.image) ? contents.image : undefined);
	let favicon = $state(isvalidURL(contents.favicon) ? contents.favicon : undefined);
	let hostname = $derived(isvalidURL(url) ? new URL(url).hostname : '');
</script>

<LinkCheck {url}>
	{#snippet ok()}
		{@render linkCard(true)}
	{/snippet}

	{#snippet ng()}
		{@render linkCard(false)}
	{/snippet}
</LinkCheck>

{#snippet linkCard(isValid: boolean)}
	{@const borderColor = isValid ? 'border-magnum-400' : 'border-neutral-400'}
	{@const divideColor = isValid ? 'divide-magnum-400' : 'divide-neutral-400'}
	{@const hoverClass = isValid ? 'hover:opacity-80' : ''}

	<!-- 共通のコンテンツ部分 -->
	{#snippet cardContent()}
		{#if imageURL}
			<blockquote class="grid grid-cols-[0.5fr_1.5fr] divide-x {divideColor} w-full">
				<figure class="flex items-center justify-center overflow-hidden">
					<img
						loading="lazy"
						height="128"
						width="128"
						class="max-h-[8rem] max-w-full overflow-hidden object-contain"
						src={imageURL}
						alt=""
						onerror={() => (imageURL = undefined)}
					/>
				</figure>

				{@render textContent()}
			</blockquote>
		{:else}
			<blockquote class="grid w-full grid-rows-[auto_1fr] p-0.5">
				{@render textContent()}
			</blockquote>
		{/if}
	{/snippet}

	<!-- テキスト部分 -->
	{#snippet textContent()}
		<div class="grid w-full grid-rows-[auto_1fr] p-0.5 pl-1">
			<h2 class="text-magnum-200 line-clamp-2 text-sm font-bold">
				{contents.title}
			</h2>
			<p
				class="text-magnum-400 line-clamp-6 max-w-full text-xs"
				style="white-space: pre-wrap; word-break: break-word;"
			>
				{contents.description}
			</p>
			<div class="flex flex-row-reverse">
				{#if favicon}
					{#if imageURL}
						<img
							width="20"
							height="20"
							loading="lazy"
							class="w-5 object-contain pr-0.5 pl-0.5"
							src={favicon}
							alt=""
						/>
					{/if}
				{/if}
				<p class="text-magnum-300 text-xs">
					{#if contents.memo}
						{contents.memo} /
					{/if}
					{hostname}
				</p>
			</div>
		</div>
	{/snippet}

	<!-- メインの要素（aタグかdivタグか） -->
	{#if isValid}
		<a
			class="m-1 rounded-lg {hoverClass} break-all {borderColor} flex w-auto overflow-hidden border"
			href={url}
			title={url}
			target="_blank"
			rel="noopener noreferrer"
		>
			{@render cardContent()}
		</a>
	{:else}
		<div class="m-1 rounded-lg break-all {borderColor} flex w-auto overflow-hidden border">
			{@render cardContent()}
		</div>
	{/if}
{/snippet}
