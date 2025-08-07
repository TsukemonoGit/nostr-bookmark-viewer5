export interface UserProfile {
	[key: string]: any;
	name?: string;
	about?: string;
	picture?: string;
	nip05?: string;
	display_name?: string;
	website?: string;
	banner?: string;
	bot?: boolean;
	lud16?: string;
	lud06?: string;
	birthday?: { year?: number; month?: number; day?: number };
}
export interface DndTagItem {
	id: string;
	tag: string[];
	originalIndex?: number;
}

export interface CreateData {
	d: string;
	title: string;
	image: string;
	description: string;
}
