<script lang="ts">
	import type { UserProfile } from '$lib/types/utiles';
	import type { Snippet } from 'svelte';
	import { datetime, formatAbsoluteDateFromUnix } from '$lib/utils/util';
	import UserAvatar from './UserAvatar.svelte';

	interface Props {
		// リアクションをしたユーザーの情報
		reactionProfile?: UserProfile | undefined;
		// リアクションの種類を示すマーク（コンポーネントとして渡す）
		reactionMark?: Snippet;
		// リアクションがあった時間
		created_at?: number | undefined;
		// 元のノートのコンポーネント
		originalNote: Snippet;
	}

	let { reactionProfile, reactionMark, created_at, originalNote }: Props = $props();
</script>

<div class="reaction-header">
	{#if reactionMark}
		<div class="reaction-mark">
			{@render reactionMark()}
		</div>
	{/if}
	<div class="reaction-info">
		<div class="note-avatar">
			{#if reactionProfile?.picture}
				<UserAvatar url={reactionProfile?.picture} name={reactionProfile.name} />
			{:else}
				<div class="avatar placeholder"></div>
			{/if}
		</div>
		{#if reactionProfile?.display_name || reactionProfile?.name}
			<span class="reaction-user-name">
				{reactionProfile?.display_name || reactionProfile?.name}
			</span>
		{/if}
	</div>
	<div class="note-time">
		{#if created_at}
			<time datetime={datetime(created_at)}>{formatAbsoluteDateFromUnix(created_at)}</time>
		{/if}
	</div>
</div>
<div class="original-note">
	{@render originalNote()}
</div>

<style lang="postcss">
	@reference "tailwindcss";
	.reaction-header {
		display: flex;
		align-items: center;
		gap: 4px;

		font-size: 14px;
	}

	.reaction-mark {
		font-size: 18px;
	}

	.reaction-info {
		flex-grow: 1; /* ユーザー名がスペースを埋める */
		display: flex;
		gap: 4px;
		overflow: hidden;
	}

	.reaction-user-name {
		font-weight: bold;
	}

	.note-time {
		font-size: 12px;
	}

	.note-avatar {
		width: 20px;
		height: 20px;
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

	.original-note {
		@apply mt-1 ml-2 rounded-md border border-neutral-300 p-2 dark:border-neutral-700;
	}
</style>
