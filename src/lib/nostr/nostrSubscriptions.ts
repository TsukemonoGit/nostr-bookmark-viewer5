import {
	createRxNostr,
	createRxBackwardReq,
	createRxForwardReq,
	uniq,
	type AcceptableDefaultRelaysConfig,
	type EventPacket,
	type OkPacketAgainstEvent,
	type OkPacket
} from 'rx-nostr';
import { tap, type Observable, type OperatorFunction } from 'rxjs';
import { verifier } from '@rx-nostr/crypto';
import * as Nostr from 'nostr-typedef';
import { createTie } from './operators';
import { bookmarkableTagsSet, defaultRelays } from '$lib/utils/constants';
import { bookmarkItemsMap, type BookmarkItem } from '$lib/types/bookmark.svelte';
import { relayStateMap } from '$lib/utils/stores.svelte';
import { createQuery, useQueryClient, type QueryKey } from '@tanstack/svelte-query';
import { derived, writable } from 'svelte/store';

const rxNostr: ReturnType<typeof createRxNostr> = createRxNostr({
	verifier,
	eoseTimeout: 3000,
	okTimeout: 3000
});
rxNostr.setDefaultRelays(defaultRelays);
rxNostr.createConnectionStateObservable().subscribe((packet) => {
	relayStateMap.update((value) => {
		return value.set(packet.from, packet.state);
	});
});

const [tie, tieMap] = createTie();

export function serRelays(relays: AcceptableDefaultRelaysConfig) {
	rxNostr.setDefaultRelays(relays);
}

// 最新の kind:10002 を取得し、relay list を返す
export async function fetchLatestRelayList(
	pubkey: string,
	timeoutMs = 7000
): Promise<Nostr.Event | null> {
	return new Promise((resolve, reject) => {
		if (!rxNostr) return reject('rxNostr not initialized');

		let event: Nostr.Event;
		const req = createRxBackwardReq();
		const sub = rxNostr
			.use(req)
			.pipe(tie, uniq())
			.subscribe({
				next: (packet) => {
					const evt = packet.event;
					if (!evt) return;
					if (!event || evt.created_at > event.created_at) event = evt;
				},
				error: (err) => {
					resolve(event);
				},
				complete: () => {
					resolve(event);
				}
			});

		// タイムアウト処理
		setTimeout(() => {
			resolve(event);
			sub.unsubscribe();
		}, timeoutMs);
		req.emit([
			{
				kinds: [10002],
				authors: [pubkey],
				limit: 1
			}
		]);
	});
}
function generateAtag(event: Nostr.Event): string {
	const dTag = event.tags.find((tag) => tag[0] === 'd')?.[1];
	return `${event.kind}:${event.pubkey}:${dTag || ''}`;
}
// タグから値を取得するヘルパー関数
function getTagValue(event: Nostr.Event, tagName: string): string | undefined {
	return event.tags.find((tag) => tag[0] === tagName)?.[1];
}

// イベントをBookmarkItemに変換
function eventToBookmarkItem(event: Nostr.Event): BookmarkItem {
	return {
		atag: generateAtag(event),
		identifier: getTagValue(event, 'd'),
		title: getTagValue(event, 'title') || getTagValue(event, 'name') || '',
		image: getTagValue(event, 'image') || getTagValue(event, 'picture'),
		description: getTagValue(event, 'description') || '',
		event
	};
}

export function isBookmarkEvent(evt: Nostr.Event): boolean {
	return evt.tags.some(([tagName]) => bookmarkableTagsSet.has(tagName));
}

function upsertByAtag(incoming: Nostr.Event) {
	const bookmarkItem = eventToBookmarkItem(incoming);
	//bookmarkItemsMapを直接操作
	bookmarkItemsMap.update((current) => {
		const existing = current.get(bookmarkItem.atag);
		if (!existing || incoming.created_at > existing.event.created_at) {
			const newMap = new Map(current);
			newMap.set(bookmarkItem.atag, bookmarkItem);
			return newMap;
		}
		return current;
	});
}
// bookmarks購読（relay listが確定してから呼ばれる）
export function subscribeBookmarkData(pubkey: string) {
	if (!rxNostr) return;
	const req = createRxForwardReq();
	rxNostr
		.use(req)
		.pipe(tie, uniq())
		.subscribe({
			next: (packet) => {
				const evt = packet.event;
				if (!evt) return;

				switch (evt.kind) {
					case 10003:
						upsertByAtag(evt);
						break;
					case 30001:
						if (isBookmarkEvent(evt)) {
							upsertByAtag(evt);
						}
						break;
					case 30003:
						upsertByAtag(evt);
						break;
				}
			},
			error: (err) => console.error('bookmark subscription error:', err)
		});

	req.emit([
		{ kinds: [10003], authors: [pubkey], limit: 1 },
		{ kinds: [30001], authors: [pubkey] },
		{ kinds: [30003], authors: [pubkey] }
	]);
}
export type ReqStatus = 'loading' | 'success' | 'error' | 'nodata';
export function useReq(
	queryKey: QueryKey,
	filters: Nostr.Filter[],
	operator?: OperatorFunction<EventPacket, EventPacket | EventPacket[]>,
	relays?: string[]
) {
	// console.log(filters);
	const _queryClient = useQueryClient(); //queryClient; //useQueryClient();
	//console.log(_queryClient);

	if (!_queryClient) {
		console.log('!_queryClient error');
		throw Error();
	}

	if (Object.entries(rxNostr.getDefaultRelays()).length <= 0) {
		console.log('DefaultRelays error', queryKey);
		throw Error();
	}
	// console.log(rxNostr.getDefaultRelays());

	const req = createRxBackwardReq();

	const status = writable<ReqStatus>('loading');
	const error = writable<Error>();

	//一定時間立って削除したデータの再取得できるように
	const obs: Observable<EventPacket | EventPacket[]> = rxNostr.use(req, { relays: relays }).pipe(
		tie,
		uniq(),
		operator ? operator : tap() // operatorがある場合は適用、ない場合は何もしないオペレーター(tapなど)
	);

	const query = createQuery({
		queryKey: queryKey,
		staleTime: Infinity,
		gcTime: Infinity, //未使用/非アクティブのキャッシュ・データがメモリに残る時間
		queryFn: (): Promise<EventPacket | EventPacket[] | null> => {
			return new Promise((resolve, reject) => {
				let fulfilled = false;

				obs.subscribe({
					next: (v: EventPacket | EventPacket[]) => {
						//  console.log(v);
						//  clearTimeoutIfExists();
						if (fulfilled) {
							_queryClient.setQueryData(queryKey, v);
						} else {
							resolve(v);
							fulfilled = true;
						}
					},

					complete: () => {
						//   clearTimeoutIfExists();
						//console.log("complete");
						status.set('success');

						if (!fulfilled) {
							resolve(null); // データが一度も来ていない場合は undefined を返す
						}
					},
					error: (e) => {
						//   clearTimeoutIfExists();
						console.log('error', e);
						status.set('error');
						error.set(e);

						if (!fulfilled) {
							reject(e); // エラーの場合は Promise を reject
							fulfilled = true;
						}
					}
				});
				req.emit(filters);
				req.over();
			});
		}
	});

	return {
		data: derived(query, ($query) => $query.data),
		status: derived([query, status], ([$query, $status]) => {
			//console.log($query.data);
			if ($query.isSuccess) {
				return 'success';
				// } else if ($query.isError) {
				//   return "error";
			} else {
				return $status;
			}
		}),
		error: derived([query, error], ([$query, $error]) => {
			//  if ($query.isError) {
			//       return $query.error;
			//   } else {
			return $error;
			//  }
		})
	};
}

const maxWaitingTime = 5000; // 3秒

/**
 * 署名済みNostrイベントをリレーに送信します。
 * @param ev 署名済みのNostrイベントオブジェクト
 * @returns リレーからのOKパケットの配列を返します。
 */
export async function publishSignEvent(ev: Nostr.Event): Promise<OkPacket[]> {
	return new Promise<OkPacket[]>((resolve) => {
		const results: OkPacket[] = [];
		let subscription: any;

		// タイムアウトを設定
		const timeoutId = setTimeout(() => {
			console.warn(`Event ${ev.id.slice(0, 8)} publish timed out.`);
			if (subscription) {
				subscription.unsubscribe();
			}
			resolve(results); // タイムアウト時の時点で収集したOKパケットを返す
		}, maxWaitingTime);

		subscription = rxNostr.send(ev).subscribe({
			next: (packet) => {
				// OKパケットのみを収集
				if (packet.ok) {
					results.push(packet);
				}
			},
			complete: () => {
				// Observableが完了したら、タイマーをクリアして解決
				clearTimeout(timeoutId);
				resolve(results);
			},
			error: (err) => {
				// エラーが発生したら、タイマーをクリアして空の配列で解決
				console.error('イベント送信中にエラーが発生しました:', err);
				clearTimeout(timeoutId);
				resolve([]);
			}
		});
	});
}
