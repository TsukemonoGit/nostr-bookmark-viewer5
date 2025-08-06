import * as nip19 from 'nostr-tools/nip19';
//import { pubkey } from '$lib/stores/settings';
import { error } from '@sveltejs/kit';

import { queryProfile } from 'nostr-tools/nip05';
import type { LayoutLoad, RouteParams } from './$types';

interface CustomParams {
	slug: string;
}
//https://kit.svelte.jp/docs/load
//ページを読み込む前に有効なparamかチェック
export const load: LayoutLoad<{
	pubkey: string;
	relays?: string[] | undefined;
	nip05Address?: string;
}> = async ({ params }: { params: RouteParams }) => {
	const { slug: npub } = params as CustomParams; // キャストして kind を取得

	//console.log(npub);
	if (npub.startsWith('npub') || npub.startsWith('nprofile')) {
		//nip19
		try {
			const { type, data } = nip19.decode(npub);
			if (type === 'npub') {
				return { pubkey: data as string };
			} else if (type === 'nprofile') {
				return { pubkey: data.pubkey, relays: data.relays ?? undefined };
			} else {
				throw error(400, 'Bad Request');
			}
		} catch (e) {
			//  console.error("[npub decode error]", e);
			throw error(400, 'Bad Request');
		}
	} else {
		//nip05
		try {
			const prof: nip19.ProfilePointer | null = await queryProfile(npub);
			if (!prof) {
				throw error(400, 'Bad Request');
			}

			return { ...prof, nip05Address: npub };
		} catch (e) {
			throw error(400, 'Bad Request');
		}
	}
};
