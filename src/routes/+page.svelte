<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { writable } from 'svelte/store';
	import { nip19 } from 'nostr-tools';
	import { Button } from 'bits-ui';
	import { waitNostr } from 'nip07-awaiter';

	const loginUser = writable('');

	let isLoading = false;
	let error = '';
	let isLoggedIn = false;
	let pubkey = '';

	onMount(async () => {
		if (browser) {
			document.addEventListener('nlAuth', (e: Event) => {
				const customEvent = e as CustomEvent;
				loginUser.set(customEvent.detail.pubkey || '');
				console.log(customEvent);

				// ログイン成功時にページ遷移（npubエンコード）
				if (customEvent.detail.pubkey) {
					pubkey = customEvent.detail.pubkey;
					isLoggedIn = true;
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

	async function handleLogin() {
		if (!browser) {
			error = 'Browser environment required';
			return;
		}

		isLoading = true;
		error = '';

		try {
			// nostr-loginによるログイン処理
			// nlAuthイベントでログイン結果を受け取る
			const nostrLogin = await import('nostr-login');
			await nostrLogin.launch();
		} catch (err) {
			error = 'Login failed or cancelled';
			console.error('Login error:', err);
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Login with Nostr</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-4">
	<div class="w-full max-w-md space-y-6">
		<div class="space-y-2 text-center">
			<h1 class="text-2xl font-bold">Login with Nostr</h1>
			<p class="text-muted-foreground">Connect your Nostr identity to view your profile</p>
		</div>

		<div class="space-y-4">
			{#if error}
				<p class="text-destructive text-center text-sm">{error}</p>
			{/if}

			{#if !isLoggedIn}
				<Button.Root onclick={handleLogin} disabled={isLoading} class="w-full">
					{#if isLoading}
						Connecting...
					{:else}
						Login with Nostr
					{/if}
				</Button.Root>

				<div class="space-y-2 text-center">
					<p class="text-muted-foreground text-sm">Need a Nostr account?</p>
					<div class="text-muted-foreground flex flex-col space-y-1 text-xs">
						<span>• Install a Nostr extension like Alby or nos2x</span>
						<span>• Or use a web signer service</span>
					</div>
				</div>
			{:else}
				<div class="space-y-2 text-center">
					<p class="text-sm text-green-600">✓ Logged in successfully</p>
					<p class="text-muted-foreground text-xs break-all">
						{pubkey}
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
