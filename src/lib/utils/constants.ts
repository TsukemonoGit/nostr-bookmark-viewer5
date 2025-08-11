export const bookmarkableTagsSet = new Set(['e', 'a', 'r', 't']);

export const relaySearchRelays = [
	//参考 https://nostter.app/nevent1qqsy739r2nqh59p8w4ufwf7ujtp4qxdwjae3uexk5fhn3pf4ntreq8q77psv7
	//kind 0 (ユーザのプロフィール) と kind 10002 (利用中のリレーリスト) 特化
	'wss://directory.yabu.me', //kind0, 3, 10002特化
	//nevent1qvzqqqqqqypzpdc866l8lkwvncdwaqlgrsueg9tvlnm5mm2mpyg3jv8aam445rpqqqsqvjvg63yukccdpfx0285v72skgv59sykpce9jtn3ynmv6jzt0v6qa84j4e
	//nevent1qvzqqqqqqypzpdc866l8lkwvncdwaqlgrsueg9tvlnm5mm2mpyg3jv8aam445rpqqyg8wumn8ghj7mn0wd68ytnhd9hx2qpq7u249qm05a9t83meh7rqxlyxq3gdrtnfswapq2sxly29zxyk0xmq977qva
	'wss://purplepag.es', //https://purplepag.es/what
	'wss://relay.nostr.band',
	//"wss://nos.lol",

	//https://lumilumi.app/nevent1qvzqqqqqqypzp978pfzrv6n9xhq5tvenl9e74pklmskh4xw6vxxyp3j8qkke3cezqqsgfmmcxyknak5frh0jpmp55w2k32l9e9h05qxjvj09hkcf0uh27nclstphx
	//https://github.com/coracle-social/compass
	'wss://indexer.coracle.social'
];
export const defaultRelays = [
	//'wss://tes'
	//'wss://relay.nostr.wirednet.jp'
	'wss://relay.nostr.band',
	'wss://nos.lol',
	// "wss://relayable.org",

	'wss://nostr.bitcoiner.social'
];

export const eventSearchRelays = [
	'wss://nostr-pub.wellorder.net',
	'wss://saltivka.org',
	'wss://relay.damus.io',
	'wss://relay.nostr.bg',
	'wss://nostr.wine',
	'wss://nos.lol',
	'wss://nostr.mom',
	'wss://atlas.nostr.land',
	'wss://relay.snort.social',
	'wss://offchain.pub',
	'wss://relay.primal.net',
	'wss://relay.nostr.band',
	'wss://public.relaying.io',
	'wss://relay.noswhere.com'
];
