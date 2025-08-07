import { toastStore } from '$lib/utils/util';
import type { EventParameters } from 'nostr-typedef';
import { nip07Signer, type OkPacket } from 'rx-nostr';
import { publishSignEvent } from './nostrSubscriptions';

// 新しい共通関数を作成
export async function publishEvent(
	eventParameters: EventParameters,
	successMessage: string,
	errorMessage: string
) {
	try {
		// 署名（ここで await して完了を保証する）
		const signer = nip07Signer();
		const signed = await signer.signEvent(eventParameters);

		// 公開処理を Promise 化（トースト表示付き）
		const publishPromise = publishSignEvent(signed);

		toastStore.promise(publishPromise, {
			loading: {
				title: '送信中...',
				description: `${successMessage.slice(0, -1)}イベントをリレーに送信しています。`
			},
			success: (result: OkPacket[]) => ({
				title: `${successMessage}！`,
				description: `${result.length}個のリレーでイベントを更新しました。`
			}),
			error: (error) => ({
				title: `${errorMessage}`,
				description: `エラー: ${typeof error === 'string' ? error : '不明なエラー'}`
			})
		});

		await publishPromise;
	} catch (error) {
		// signer.signEvent などの失敗時
		toastStore.error({
			type: 'error',
			title: `${errorMessage}`,
			description: `エラー: ${typeof error === 'string' ? error : '不明なエラー'}`
		});
	}
}
