// src/lib/i18n/index.ts（初期化部分）
import { initI18n, registerLocale } from '@konemono/svelte5-i18n';

// 言語ファイルを登録
registerLocale('ja', () => import('./locales/ja.json'));
registerLocale('en', () => import('./locales/en.json'));

// 初期化
initI18n({
	defaultLocale: 'en',
	supportedLocales: ['ja', 'en'],
	fallbackLocale: 'en',
	debug: false
});
