import '$lib/i18n/index.ts';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';
import { setLocale } from '@konemono/svelte5-i18n';

export const load: LayoutLoad = async () => {
	if (browser) {
		setLocale(window.navigator.language);
	}
};
