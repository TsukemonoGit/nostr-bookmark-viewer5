// src/routes/+layout.ts
import '$lib/i18n/index.ts';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';
import { setLocale, waitLocale } from '@konemono/svelte5-i18n';

export const load: LayoutLoad = async ({ data }) => {
	if (browser) {
		// クライアントサイドでは保存された設定または browser言語を使用
		const savedLocale = localStorage.getItem('preferred-locale');
		const browserLocale = navigator.language.split('-')[0];
		const supportedLocales = ['ja', 'en'];

		const clientLocale =
			savedLocale || (supportedLocales.includes(browserLocale) ? browserLocale : 'en');

		await setLocale(clientLocale);
	}

	// 翻訳データの読み込み完了を待つ
	await waitLocale();

	return {};
};
