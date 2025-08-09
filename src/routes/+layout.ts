// +layout.ts
import { browser } from '$app/environment';
import '$lib/i18n'; // Import to initialize. Important :)
import { setLocale, waitLocale } from '@konemono/svelte5-i18n';

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	if (browser) {
		// ブラウザ言語から適切な言語コードを抽出
		const browserLang = window.navigator.language.split('-')[0]; // ja-JP -> ja
		const supportedLocales = ['en', 'ja'];
		const locale = supportedLocales.includes(browserLang) ? browserLang : 'en';

		await setLocale(locale);
	}
	await waitLocale();
};
