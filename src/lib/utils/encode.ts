import * as nip19 from 'nostr-tools/nip19';
export function encodetoNote(str: string | undefined): string {
	if (!str) return '';
	try {
		return nip19.noteEncode(str);
	} catch (error) {
		return str;
	}
}

export function encodetoNevent(obj: nip19.EventPointer): string {
	try {
		return nip19.neventEncode(obj);
	} catch (error) {
		return obj.id;
	}
}
export function encodetoNpub(str: string): string {
	try {
		return nip19.npubEncode(str);
	} catch (error) {
		return str;
	}
}

export function encodetoNaddr(str: string | undefined): string {
	if (!str) return '';
	const naddr = parseNaddr(['a', str]);
	try {
		return nip19.naddrEncode(naddr);
	} catch (error) {
		return str;
	}
}
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
