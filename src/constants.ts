import { WPPostStatus } from './types.js'

export const END_POINT = {
	MEDIA: 'wp/v2/media',
	PAGES: 'wp/v2/pages',
	POSTS: 'wp/v2/posts',
}

export const ERROR_MESSAGE = {
	DETAILED: '[WpApiClient] Error: %error%',
	GENERIC: '[WpApiClient] Error. Misconfiguration?',
	INVALID_BASEURL: '[WpApiClient] Invalid baseURL: %url%',
}

export const POST_STATUS_MAP = [
	WPPostStatus.DRAFT,
	WPPostStatus.FUTURE,
	WPPostStatus.PENDING,
	WPPostStatus.PRIVATE,
	WPPostStatus.PUBLISH,
]
