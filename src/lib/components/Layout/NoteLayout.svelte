<script lang="ts">
	import type { UserProfile } from '$lib/types/utiles';
	import type { Snippet } from 'svelte';
	import UserAvatar from './UserAvatar.svelte';
	import { datetime, formatAbsoluteDateFromUnix } from '$lib/utils/util';
	import DisplayName from './DisplayName.svelte';
	import WarningHide from './WarningHide.svelte';
	import { commonMenu } from '$lib/utils/stores.svelte';

	interface Props {
		tags: string[][];
		profile?: UserProfile | undefined;
		created_at?: number | undefined;
		hasError?: boolean;

		warningText?: string | undefined; // ワーニングメッセージ

		name?: Snippet;
		content?: Snippet;
		error?: Snippet;
		replyUser?: Snippet;
	}
	let {
		profile,
		tags,
		hasError = false,
		created_at,
		name,

		content,
		error,

		replyUser,
		warningText
	}: Props = $props();
</script>

{#if hasError}
	<div class="note-error">
		{#if error}
			{@render error()}
		{:else}
			Error loading note
		{/if}
	</div>
{:else}
	<div class="nostr-wrapper">
		<div class="note-header">
			<div class="note-avatar">
				{#if profile?.picture}
					<UserAvatar url={profile?.picture} name={profile.name} />
				{:else}
					<div class="avatar placeholder"></div>
				{/if}
			</div>
			<div class="note-name">
				{#if profile?.name || profile?.display_name}
					<DisplayName
						height={21}
						name="{profile?.display_name}@{profile?.name || 'no name'}"
						{tags}
					/>
				{:else}
					<div class="name placeholder"></div>
				{/if}
			</div>
			<div class="note-time">
				{#if created_at}
					<time datetime={datetime(created_at)}>{formatAbsoluteDateFromUnix(created_at)}</time>
				{:else}
					<div class="time placeholder"></div>
				{/if}
			</div>
		</div>
		<div class="note-body-wrapper">
			{#if replyUser}<div class="mention-container">{@render replyUser?.()}</div>{/if}
			<div class="note-body">
				{#if content}
					{@render content()}
					{#if warningText !== undefined && commonMenu.get()[0].checked}
						<WarningHide text={warningText} />
					{/if}
				{:else}
					<div class="content placeholder"></div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	.note-error {
		padding: 12px;
		border: 1px solid var(--error-border);
		background-color: var(--error-bg);
		color: var(--error-text);
		border-radius: 6px;
	}

	.nostr-wrapper {
		@apply max-w-full overflow-x-hidden;
		display: flex;
		flex-direction: column;
	}

	.note-header {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.note-avatar {
		width: 40px;
		height: 40px;
		border-radius: 20%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.note-avatar > :global(*) {
		max-width: 100%;
		max-height: 100%;
		object-fit: cover;
		border-radius: 20%;
	}

	.note-name {
		width: 4em;
		font-weight: bold;
		font-size: 14px;
		color: var(--name-color);
		flex-grow: 1; /* 名前が残りスペースを埋める */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.note-time {
		font-size: 12px;
		color: var(--time-color);
		flex-shrink: 0;
	}

	.note-body-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.note-body {
		position: relative;
	}

	.placeholder {
		background-color: var(--placeholder-color);
		border-radius: 4px;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.placeholder.avatar {
		width: 40px;
		height: 40px;
		border-radius: 20%;
	}

	.placeholder.name {
		width: 80px;
		height: 14px;
	}

	.placeholder.time {
		width: 60px;
		height: 10px;
	}

	.placeholder.content {
		width: 100%;
		height: 48px;
		margin-top: 4px;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	.mention-container {
		margin: 4px 0;
		font-size: small;
		display: inline-flex;
		flex-wrap: wrap;
		max-height: 3.5em;
		overflow-y: auto;
		white-space: nowrap;

		/* メンション欄装飾 */
		padding-left: 8px; /* ライン分の余白 */
		border-left: 4px solid var(--mention-line-color, #3b82f6);
		border-radius: 4px;
		gap: 4px;
		align-items: center;
	}
</style>
