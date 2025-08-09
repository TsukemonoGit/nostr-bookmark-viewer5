// src/routes/+layout.ts
import '$lib/i18n/index.ts';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';
import { setLocale, waitLocale } from '@konemono/svelte5-i18n';

export const load: LayoutLoad = async () => {
	if (browser) {
		const savedLocale = localStorage.getItem('preferred-locale');
		const browserLocale = navigator.language.split('-')[0];
		const supportedLocales = ['en', 'ja'];

		const clientLocale =
			savedLocale || (supportedLocales.includes(browserLocale) ? browserLocale : 'en');

		await setLocale(clientLocale);
	}

	await waitLocale();
	return {};
};
