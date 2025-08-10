import type { ConnectionState } from 'rx-nostr';
import * as Nostr from 'nostr-typedef';
import { SvelteMap } from 'svelte/reactivity';
import type { QueryClient } from '@tanstack/svelte-query';

export const relayStateMap = createCustomStore<SvelteMap<string, ConnectionState>>(new SvelteMap());
export const kind10002 = createCustomStore<Nostr.Event | null>(null);
export const loginUser = createCustomStore<string | undefined>(undefined);
export const queryClient = createCustomStore<QueryClient | undefined>(undefined);
export const nostrShare = createCustomStore<HTMLElement | null>(null);
export const shareText = createCustomStore<string | undefined>(undefined);
//-------------------------------------

// 汎用的なカスタムストア作成関数
function createCustomStore<T>(initialValue: T) {
	let state: T = $state.raw(initialValue);
	let subscribers: Array<(value: T) => void> = [];

	return {
		get: () => state,
		set: (value: T) => {
			state = value;
			subscribers.forEach((subscriber) => subscriber(state));
		},
		update: (updater: (current: T) => T) => {
			state = updater(state);
			subscribers.forEach((subscriber) => subscriber(state));
		},
		subscribe: (subscriber: (value: T) => void) => {
			subscribers.push(subscriber);
			subscriber(state); // 初回呼び出し
			return () => {
				subscribers = subscribers.filter((s) => s !== subscriber);
			};
		}
	};
}
