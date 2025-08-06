import * as Nostr from 'nostr-typedef';
import { writable } from 'svelte/store';

export interface BookmarkItem {
	atag: string; // 一意識別子
	identifier?: string;
	title?: string;
	image?: string;
	description?: string;
	event: Nostr.Event;
}
//単一のデータストア: kind: 10003, 30001, 30003の3種類のイベントが、すべて同じMap<string, BookmarkItem>ストアに集約されます。
export const bookmarkItemsMap = writable<Map<string, BookmarkItem>>(new Map());

/* // kind: 10003のみを含む派生ストア
export const BookmarkList = derived(bookmarkItemsMap, ($map) => {
	// Mapを配列に変換し、kindが10003のアイテムだけをフィルタリング
	return Array.from($map.values()).filter((item) => item.event.kind === 10003);
});

// kind: 30003のみを含む派生ストア
export const Bookmarksets = derived(bookmarkItemsMap, ($map) => {
	return Array.from($map.values()).filter((item) => item.event.kind === 30003);
});

// kind: 30001のみを含む派生ストア
export const Genericlists = derived(bookmarkItemsMap, ($map) => {
	return Array.from($map.values()).filter((item) => item.event.kind === 30001);
}); */

export type BookmarksName = 'BookmarkList' | 'Bookmarksets' | 'Genericlists';
