import '$lib/i18n/index.ts';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';
import { setLocale, waitLocale } from '@konemono/svelte5-i18n';

export const load: LayoutLoad = async ({ data }) => {
	// サーバーサイドで検出された言語を優先
	const serverLocale = data.locale;

	if (browser) {
		// クライアントサイドでは、まずサーバーの言語設定を使用
		await setLocale(serverLocale);

		// その後、保存された設定があれば適用
		const savedLocale = localStorage.getItem('preferred-locale');
		if (savedLocale && savedLocale !== serverLocale) {
			await setLocale(savedLocale);
		}
	} else {
		// サーバーサイドでは既に設定済みなので再設定不要
	}

	await waitLocale();
	return { locale: serverLocale };
};
