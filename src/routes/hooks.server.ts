// hooks.server.ts
import { setLocale, getI18nOptions } from '@konemono/svelte5-i18n';
import type { Handle } from '@sveltejs/kit';

function getPreferredLocale(acceptLanguage: string | null, supportedLocales: string[]): string {
	if (!acceptLanguage) return 'en';

	const languages = acceptLanguage
		.split(',')
		.map((lang) => lang.split(';')[0].trim())
		.map((lang) => lang.split('-')[0]); // en-US -> en

	for (const lang of languages) {
		if (supportedLocales.includes(lang)) {
			return lang;
		}
	}
	return 'en';
}

export const handle: Handle = async ({ event, resolve }) => {
	const options = getI18nOptions();
	const acceptLanguage = event.request.headers.get('accept-language');
	const preferredLocale = getPreferredLocale(
		acceptLanguage,
		options.supportedLocales || ['en', 'ja']
	);

	await setLocale(preferredLocale);

	return resolve(event);
};
