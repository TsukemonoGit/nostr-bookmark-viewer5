import type { ConnectionState } from 'rx-nostr';
import * as Nostr from 'nostr-typedef';
import { SvelteMap } from 'svelte/reactivity';
import type { QueryClient } from '@tanstack/svelte-query';

export const relayStateMap = createCustomStore<SvelteMap<string, ConnectionState>>(new SvelteMap());
export const kind10002 = createCustomStore<Nostr.Event | null>(null);
export const loginUser = createCustomStore<string | undefined>(undefined);
export const queryClient = createCustomStore<QueryClient | undefined>(undefined);
export const nostrShare = createCustomStore<HTMLElement | null>(null);
export const shareText = createCustomStore<string>('');

export type MenuItemConfig = {
	checked: boolean;
	labelKey: string;
};

export type CommonMenuConfig = {
	enableWarning: MenuItemConfig;
	light: MenuItemConfig;
};

export const commonMenu = createCustomStore<CommonMenuConfig>(
	{
		enableWarning: { checked: true, labelKey: 'commonMenu.enableWarning' },
		light: { checked: false, labelKey: 'commonMenu.light' }
	},
	{
		storageKey: 'commonSettings',
		loadFromStorage: (key, defaultValue) => {
			try {
				const saved = localStorage.getItem(key);
				if (saved) {
					const parsed = JSON.parse(saved);
					// デフォルト値のコピーを作成
					const result = structuredClone(defaultValue);

					// 各キーについて、保存されたchecked値があれば上書き
					Object.keys(result).forEach((id) => {
						const savedItem = parsed[id];
						if (savedItem && typeof savedItem.checked === 'boolean') {
							result[id as keyof CommonMenuConfig].checked = savedItem.checked;
						}
					});

					return result;
				}
			} catch (error) {
				console.warn('Failed to load from localStorage:', error);
			}
			return defaultValue;
		},
		saveToStorage: (key, value) => {
			try {
				// checked のみを保存
				const checkedOnly = Object.fromEntries(
					Object.entries(value).map(([id, item]) => [id, { checked: item.checked }])
				);
				localStorage.setItem(key, JSON.stringify(checkedOnly));
			} catch (error) {
				console.warn('Failed to save to localStorage:', error);
			}
		}
	}
);

//-------------------------------------

// 汎用的なカスタムストア作成関数
function createCustomStore<T>(
	initialValue: T,
	options?: {
		storageKey?: string;
		loadFromStorage?: (key: string, defaultValue: T) => T;
		saveToStorage?: (key: string, value: T) => void;
	}
) {
	// localStorage から初期値を読み込み
	let loadedValue: T = initialValue;
	if (options?.storageKey && typeof window !== 'undefined') {
		loadedValue = options.loadFromStorage?.(options.storageKey, initialValue) ?? initialValue;
	}

	let state: T = $state(loadedValue);
	let subscribers: Array<(value: T) => void> = [];

	return {
		get: () => state,
		set: (value: T) => {
			state = value;
			// localStorage に保存
			if (options?.storageKey && typeof window !== 'undefined') {
				options.saveToStorage?.(options.storageKey, state);
			}
			subscribers.forEach((subscriber) => subscriber(state));
		},
		update: (updater: (current: T) => T) => {
			state = updater(state);
			// localStorage に保存
			if (options?.storageKey && typeof window !== 'undefined') {
				options.saveToStorage?.(options.storageKey, state);
			}
			subscribers.forEach((subscriber) => subscriber(state));
		},
		subscribe: (subscriber: (value: T) => void) => {
			subscribers.push(subscriber);
			subscriber(state);
			return () => {
				subscribers = subscribers.filter((s) => s !== subscriber);
			};
		}
	};
}
