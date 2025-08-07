<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { waitNostr } from 'nip07-awaiter';
	import { nip19 } from 'nostr-tools';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { toastStore } from '$lib/utils/util';
	import { Toaster } from '@skeletonlabs/skeleton-svelte';

	let { children } = $props();

	onMount(async () => {
		if (browser) {
			document.addEventListener('nlAuth', (e: Event) => {
				const customEvent = e as CustomEvent;

				console.log(customEvent);

				// 現在のパスがトップページ（'/'）であるか確認
				if (page.url.pathname === '/') {
					const npub = nip19.npubEncode(customEvent.detail.pubkey);
					goto(`/${npub}`);
				}
			});

			await waitNostr(1000);
			const initNostrLogin = await import('nostr-login');
			await initNostrLogin.init({
				/*options*/
			});
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
<Toaster toaster={toastStore}></Toaster>
