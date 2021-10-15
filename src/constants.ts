export const END_POINT = {
	BLOCK_DIRECTORY: 'wp/v2/block-directory/search',
	BLOCK_TYPES: 'wp/v2/block-types',
	CATEGORIES: 'wp/v2/categories',
	COMMENTS: 'wp/v2/comments',
	MEDIA: 'wp/v2/media',
	PAGES: 'wp/v2/pages',
	PLUGINS: 'wp/v2/plugins',
	POSTS: 'wp/v2/posts',
	SEARCH: 'wp/v2/search',
	SETTINGS: 'wp/v2/settings',
	STATUSES: 'wp/v2/statuses',
	TAGS: 'wp/v2/tags',
	TYPES: 'wp/v2/types',
	USERS: 'wp/v2/users',
}

export const ERROR_MESSAGE = {
	DETAILED: '[WpApiClient Error] %error%',
	ERROR_RESPONSE:
		'[WpApiClient Error] There was an error when calling the end point %url%: %error%',
	GENERIC: '[WpApiClient Error] Misconfiguration?',
	ID_REQUIRED:
		'[WpApiClient Error] At least one ID must be provided to .delete()',
	INVALID_BASEURL: '[WpApiClient Error] Invalid baseURL: %url%',
	INVALID_FILENAME:
		'[WpApiClient Error] The fileName must include the file extension (e.g.: %fileName%.jpg).',
}
