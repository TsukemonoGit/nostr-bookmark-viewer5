export const cleanRelayUrl = (url: string) => url.replace(/\/$/, '');

export function getColor(state: string | undefined): string {
	switch (state) {
		case 'initialized':
			return 'text-gray-500';
		case 'connecting':
			return 'text-blue-500';
		case 'connected':
			return 'text-green-500';
		case 'waiting-for-retrying':
		case 'retrying':
			return 'text-yellow-500';
		case 'dormant':
			return 'text-purple-500';
		case 'error':
		case 'rejected':
		case 'terminated':
			return 'text-red-500';
		default:
			return 'text-gray-500';
	}
}
