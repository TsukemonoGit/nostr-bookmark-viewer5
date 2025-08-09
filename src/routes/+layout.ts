// +layout.ts
import { browser } from '$app/environment';
import '$lib/i18n'; // Import to initialize. Important :)
import { setLocale, waitLocale } from '@konemono/svelte5-i18n';

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	if (browser) {
		setLocale(window.navigator.language);
	}
	await waitLocale();
};
