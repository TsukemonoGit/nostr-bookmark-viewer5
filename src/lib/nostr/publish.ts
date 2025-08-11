import { toastStore } from '$lib/utils/util';
import { t } from '@konemono/svelte5-i18n';
import { get } from 'svelte/store'; // ストアから値を取得するため
import type { EventParameters } from 'nostr-typedef';
import { nip07Signer, type OkPacket } from 'rx-nostr';
import { publishSignEvent } from './nostrSubscriptions';

// 新しい共通関数を作成
export async function publishEvent(eventParameters: EventParameters, title: string) {
	try {
		// 署名（ここで await して完了を保証する）
		const signer = nip07Signer();
		const signed = await signer.signEvent(eventParameters);

		// 公開処理を Promise 化（トースト表示付き）
		const publishPromise = publishSignEvent(signed);

		// t関数を取得
		const tFunc = get(t);

		toastStore.promise(publishPromise, {
			loading: {
				title: tFunc('common.sending'),
				description: tFunc('common.sendingEvent', { action: title })
			},
			success: (result: OkPacket[]) => ({
				title: tFunc('common.publishSuccess', { action: title }),
				description: tFunc('common.eventUpdated', { count: result.length })
			}),
			error: (error) => ({
				title: tFunc('common.publishFailed', { action: title }),
				description: tFunc('common.error', {
					message: typeof error === 'string' ? error : tFunc('common.unknownError')
				})
			})
		});

		await publishPromise;
	} catch (error) {
		// signer.signEvent などの失敗時
		const tFunc = get(t);
		toastStore.error({
			type: 'error',
			title: tFunc('common.publishError', { action: title }),
			description: tFunc('common.error', {
				message: typeof error === 'string' ? error : tFunc('common.unknownError')
			})
		});
	}
}
