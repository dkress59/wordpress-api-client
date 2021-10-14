export const END_POINT = {
	CATEGORIES: 'wp/v2/categories',
	MEDIA: 'wp/v2/media',
	PAGES: 'wp/v2/pages',
	POSTS: 'wp/v2/posts',
	TAGS: 'wp/v2/tags',
	USERS: 'wp/v2/users',
}

export const ERROR_MESSAGE = {
	DETAILED: '[WpApiClient Error] %error%',
	ERROR_RESPONSE:
		'[WpApiClient Error] There was an error when calling the end point %url%: %error%',
	GENERIC: '[WpApiClient Error] Misconfiguration?',
	INVALID_BASEURL: '[WpApiClient Error] Invalid baseURL: %url%',
	INVALID_FILENAME:
		'[WpApiClient Error] The fileName must include the file extension (e.g.: %fileName%.jpg).',
}
