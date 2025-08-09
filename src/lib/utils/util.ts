import type { nip19 } from 'nostr-tools';
import { createToaster } from '@skeletonlabs/skeleton-svelte';
import { hexRegex, nip33Regex } from './regex';

export const toastStore = createToaster();
export function parseNaddr(tag: string[]): nip19.AddressPointer {
	const [, reference, relay] = tag; // 配列の2番目の要素を取り出す
	const [kind, pubkey, ...identifierParts] = reference.split(':'); // referenceをコロンで分割, identifierの中に:が含まれる可能性がある
	const identifier = identifierParts.join(':'); // identifierの部分を結合する
	//console.log(identifier);
	return relay !== undefined && relay !== ''
		? {
				kind: Number(kind),
				pubkey: pubkey,
				identifier: identifier ?? '',
				relays: [relay]
			}
		: {
				kind: Number(kind),
				pubkey: pubkey,
				identifier: identifier ?? ''
			};
}

/**
 * 日付の表示オプションを生成
 */
function getDateFormatOptions(date: Date, now: Date, full: boolean): Intl.DateTimeFormatOptions {
	const sameYear = date.getFullYear() === now.getFullYear();
	const sameMonth = sameYear && date.getMonth() === now.getMonth();
	const sameDay = sameMonth && date.getDate() === now.getDate();

	const options: Intl.DateTimeFormatOptions = {
		hour: '2-digit',
		minute: '2-digit'
	};

	if (full || !sameDay) {
		options.month = '2-digit';
		options.day = '2-digit';
	}

	if (full || !sameYear) {
		options.year = 'numeric';
	}

	return options;
}

/**
 * 汎用フォーマット関数（Date）
 */
function formatDateWithOptions(date: Date, options: Intl.DateTimeFormatOptions): string {
	return date.toLocaleString([], options);
}

/**
 * Unix秒からフォーマット
 */
export function formatAbsoluteDateFromUnix(unixTime: number, full: boolean = false): string {
	const date = new Date(unixTime * 1000);
	return formatAbsoluteDateFromDate(date, full);
}

/**
 * Dateからフォーマット
 */
export function formatAbsoluteDateFromDate(date: Date, full: boolean = false): string {
	const now = new Date();
	const options = getDateFormatOptions(date, now, full);
	return formatDateWithOptions(date, options);
}
export function datetime(unixtime: number) {
	const time = new Date(unixtime * 1000);

	return time.toISOString();
}

export const repostedId = (
	tags: string[][]
): { tag: string[] | undefined; kind: number | undefined } => {
	const kindtag = tags.find((tag) => tag[0] === 'k');
	const kind = kindtag ? Number(kindtag[1]) : undefined;
	return {
		tag: tags
			.slice()
			.reverse()
			.find(
				(tag) =>
					(tag[0] === 'e' && hexRegex.test(tag[1])) || (tag[0] === 'a' && nip33Regex.test(tag[1]))
			),
		kind: kind
	};
};
