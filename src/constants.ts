export const END_POINT = {
	BLOCK_DIRECTORY: 'wp/v2/block-directory/search',
	BLOCK_RENDERER: 'wp/v2/block-renderer',
	BLOCK_TYPES: 'wp/v2/block-types',
	CATEGORIES: 'wp/v2/categories',
	COMMENTS: 'wp/v2/comments',
	EDITOR_BLOCKS: 'wp/v2/blocks',
	MEDIA: 'wp/v2/media',
	PAGES: 'wp/v2/pages',
	PLUGINS: 'wp/v2/plugins',
	POSTS: 'wp/v2/posts',
	SEARCH: 'wp/v2/search',
	SETTINGS: 'wp/v2/settings',
	STATUSES: 'wp/v2/statuses',
	TAGS: 'wp/v2/tags',
	TAXONOMIES: 'wp/v2/taxonomies',
	THEMES: 'wp/v2/themes',
	TYPES: 'wp/v2/types',
	USER_APPLICATION_PASSWORDS: 'application-passwords',
	USERS_ME: 'wp/v2/users/me',
	USERS: 'wp/v2/users',
}

export const ERROR_MESSAGE = {
	DETAILED: '[WpApiClient Error] %error%',
	ERROR_RESPONSE:
		'[WpApiClient Error] There was an error when calling the end point %url%: %error% (%status%)',
	GENERIC: '[WpApiClient Error] Misconfiguration?',
	ID_REQUIRED:
		'[WpApiClient Error] At least one ID must be provided to .delete()',
	INVALID_BASEURL: '[WpApiClient Error] Invalid baseUrl: %url%',
	INVALID_FILENAME:
		'[WpApiClient Error] The fileName must include the file extension (e.g.: %fileName%.jpg).',
}

export const END_POINT_PROTECTED = {
	GET: [
		END_POINT.BLOCK_TYPES,
		END_POINT.EDITOR_BLOCKS,
		END_POINT.PLUGINS,
		END_POINT.SETTINGS,
		END_POINT.THEMES,
		END_POINT.USER_APPLICATION_PASSWORDS,
		END_POINT.USERS_ME,
	],
	POST: [...Object.values(END_POINT)],
	DELETE: [...Object.values(END_POINT)],
}

export const END_POINT_PUBLIC = {
	GET: Object.values(END_POINT).filter(
		uri =>
			!END_POINT_PROTECTED.GET.includes(uri) &&
			!(
				uri.includes(END_POINT.USER_APPLICATION_PASSWORDS) &&
				uri.includes(END_POINT.USERS)
			),
	),
	POST: [],
	DELETE: [],
}
