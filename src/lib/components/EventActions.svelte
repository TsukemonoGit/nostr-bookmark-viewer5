<script lang="ts">
	import { t } from '@konemono/svelte5-i18n';

	let { event, seenOnRelays, bloadcastEvent, setRelayHint, editable } = $props();
</script>

{#if event}
	<button class="mt-2 btn preset-outlined-secondary-500" onclick={() => bloadcastEvent(event)}
		>{$t('common.bloadcast')}</button
	>
{/if}
{#if seenOnRelays.length > 0}
	<h3 class="mt-4 mb-2 font-semibold">{$t('common.seen_on_relays')}:</h3>

	{#each seenOnRelays as relay}
		<div class="flex w-full flex-wrap gap-1">
			{#if editable}
				<button class="preset-outlined-primary-500 btn-sm" onclick={() => setRelayHint?.(relay)}
					>{$t('common.set_relay_hint')}</button
				>{/if}
			{relay}
		</div>
	{/each}
{/if}
