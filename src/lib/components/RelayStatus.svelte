<script lang="ts">
	import { cleanRelayUrl, getColor } from '$lib/utils/relayStatus';

	import { kind10002, relayStateMap } from '$lib/utils/stores.svelte';
	import { Circle, RadioTower } from '@lucide/svelte';
	import { Popover } from 'bits-ui';

	let relayTags: string[][] = $derived(kind10002.get()?.tags.filter((tag) => tag[0] === 'r') || []);
</script>

<Popover.Root>
	<Popover.Trigger
		class="rounded-input bg-dark
	text-background shadow-mini hover:bg-dark/95 inline-flex h-6 items-center justify-center px-2 text-[15px] font-medium whitespace-nowrap transition-all select-none hover:cursor-pointer active:scale-[0.98]"
	>
		<RadioTower size="20" />
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Content
			class="border-dark-10 shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-30 w-full max-w-[328px] origin-(--bits-popover-content-transform-origin) rounded-[12px] border bg-neutral-100 p-4 dark:bg-neutral-900"
			sideOffset={8}
		>
			{#each relayTags as relay}
				{@const url = cleanRelayUrl(relay[1])}
				<div>
					<Circle
						size="20"
						class="{getColor(
							relayStateMap.get().get(url)
						)} mr-1  inline-block min-w-[20px] fill-current"
					/>{url}
				</div>
			{/each}</Popover.Content
		>
	</Popover.Portal>
</Popover.Root>
