<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { Check } from '@lucide/svelte';
	import { commonMenu, type CommonMenuConfig } from '$lib/utils/stores.svelte';
	import { t } from '@konemono/svelte5-i18n';

	function toggleItem(id: keyof CommonMenuConfig, checked: boolean) {
		commonMenu.update((current) => ({
			...current,
			[id]: {
				...current[id],
				checked
			}
		}));
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class="rounded bg-surface-200 px-2 py-1 dark:bg-surface-800"
		>Menu</DropdownMenu.Trigger
	>
	<DropdownMenu.Portal>
		<DropdownMenu.Content class="rounded-md bg-surface-100 p-1 dark:bg-surface-900">
			{#each Object.entries(commonMenu.get()) as [id, item]}
				<DropdownMenu.CheckboxItem
					checked={item.checked}
					onCheckedChange={(checked) => toggleItem(id as keyof CommonMenuConfig, checked)}
					class="flex items-center gap-2 rounded px-2 py-1 hover:bg-surface-200 hover:dark:bg-surface-800"
				>
					<div class="w-4">
						{#if item.checked}
							<Check class="size-4" />
						{/if}
					</div>
					{$t(item.labelKey)}
				</DropdownMenu.CheckboxItem>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
