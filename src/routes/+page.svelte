<script lang="ts">
	import { t } from '@konemono/svelte5-i18n';
	import { browser } from '$app/environment';
	import { Button } from 'bits-ui';

	let isLoading = false;
	let error = '';
	let isLoggedIn = false;
	let pubkey = '';

	async function handleLogin() {
		if (!browser) {
			error = $t('login.error.browserRequired');
			return;
		}

		isLoading = true;
		error = '';

		try {
			const nostrLogin = await import('nostr-login');
			await nostrLogin.launch();
		} catch (err) {
			error = $t('login.error.failed');
			console.error('Login error:', err);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<div class="w-full max-w-md space-y-6">
		<div class="space-y-2 text-center">
			<h1 class="text-2xl font-bold">{$t('login.heading')}</h1>
			<p class="text-muted-foreground">{$t('login.subtitle')}</p>
		</div>

		<div class="space-y-4">
			{#if error}
				<p class="text-destructive text-center text-sm">{error}</p>
			{/if}

			{#if !isLoggedIn}
				<Button.Root
					onclick={handleLogin}
					disabled={isLoading}
					class="btn w-full preset-outlined-primary-500"
				>
					{#if isLoading}
						{$t('login.connecting')}
					{:else}
						{$t('login.button')}
					{/if}
				</Button.Root>

				<div class="space-y-2 text-center">
					<p class="text-muted-foreground text-sm">{$t('login.needAccount')}</p>
					<div class="text-muted-foreground flex flex-col space-y-1 text-xs">
						<span>• {$t('login.tip.installExtension')}</span>
						<span>• {$t('login.tip.useWebSigner')}</span>
					</div>
				</div>
			{:else}
				<div class="space-y-2 text-center">
					<p class="text-sm text-green-600">✓ {$t('login.success')}</p>
					<p class="text-muted-foreground text-xs break-all">
						{pubkey}
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
