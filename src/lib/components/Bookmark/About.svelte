<script lang="ts">
	import { Info, X } from '@lucide/svelte';
	import { Dialog, Separator } from 'bits-ui';
	import { t } from '@konemono/svelte5-i18n';
	import UserName from '../Layout/UserName.svelte';
	import Link from '../Layout/Link.svelte';

	let isOpen = $state(false);

	interface Props {
		disabled?: boolean;
	}
	let { disabled = false }: Props = $props();
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger
		{disabled}
		class="flex items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors hover:bg-neutral-200 hover:opacity-100 dark:hover:bg-neutral-800"
	>
		<Info size={14} />About
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
		/>
		<Dialog.Content
			class="rounded-card-lg shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border bg-neutral-100 p-5 outline-hidden sm:max-w-[490px] md:w-full dark:bg-neutral-900"
		>
			<Dialog.Title
				class="flex w-full items-center justify-center text-lg font-semibold tracking-tight"
			>
				About
			</Dialog.Title>
			<Separator.Root class="bg-muted -mx-5 mt-5 mb-6 block h-px" />
			<Dialog.Description class="text-foreground-alt text-sm"></Dialog.Description>
			<div class="max-h-[min(24em,80vh)] overflow-y-auto">
				<div>About: {$t('description')}</div>
				<div>
					Author: <Link
						href="https://lumilumi.app/mono@tsukemonogit.github.io"
						class=" inline-flex w-fit  text-primary-800 hover:underline dark:text-primary-200"
					>
						<UserName
							pubhex="84b0c46ab699ac35eb2ca286470b85e081db2087cdef63932236c397417782f5"
							relays={['wss://yabu.me', 'wss://nostr.compile-error.net']}
						/></Link
					>
				</div>
			</div>

			<Dialog.Close
				class="focus-visible:ring-foreground focus-visible:ring-offset-background absolute top-5 right-5 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-[0.98]"
			>
				<div>
					<X class="text-foreground size-5" />
					<span class="sr-only">{$t('common.close')}</span>
				</div>
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
