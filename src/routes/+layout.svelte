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
	import { loginUser } from '$lib/utils/stores.svelte';
	import '$lib/i18n/index.ts';
	import { t } from '@konemono/svelte5-i18n';
	let { children } = $props();

	onMount(async () => {
		if (browser) {
			document.addEventListener('nlAuth', (e: Event) => {
				const customEvent = e as CustomEvent;
				const pubkey = customEvent.detail.pubkey;
				if (!pubkey) {
					loginUser.set(undefined);
					return;
				}

				loginUser.set(pubkey);
				console.log(customEvent);

				// 現在のパスがトップページ（'/'）であるか確認
				if (page.url.pathname === '/') {
					const npub = nip19.npubEncode(pubkey);
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
	<title>{$t('title')}</title>
	<meta property="og:title" content={$t('title')} />
	<!-- <meta property="og:image" content={`${page.url.origin}/ogp.webp`} /> -->

	<meta name="description" content={$t('description')} />

	<meta property="og:description" content={$t('description')} />
</svelte:head>

{@render children?.()}
<Toaster toaster={toastStore}></Toaster>
