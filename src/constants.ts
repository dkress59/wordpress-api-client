import { WP_Post_Status_Name, WP_Post_Type_Name } from 'wp-types'

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
	MISSING_REQUIRED_PARAM:
		'[WpApiClient Error] Required param %PARAM% missing.',
}

export const END_POINT_PROTECTED = {
	GET: [
		END_POINT.BLOCK_DIRECTORY,
		END_POINT.BLOCK_TYPES,
		END_POINT.EDITOR_BLOCKS,
		END_POINT.PLUGINS,
		END_POINT.SETTINGS,
		END_POINT.THEMES,
		END_POINT.USER_APPLICATION_PASSWORDS,
		END_POINT.USERS,
		END_POINT.USERS_ME,
	],
	POST: Object.values(END_POINT),
	DELETE: Object.values(END_POINT),
}

export const TRASHABLE = [
	END_POINT.EDITOR_BLOCKS,
	END_POINT.PAGES,
	END_POINT.POSTS,
]

export const END_POINT_PUBLIC = {
	GET: Object.values(END_POINT).filter(
		endPoint => !END_POINT_PROTECTED.GET.includes(endPoint),
	),
	POST: Object.values(END_POINT).filter(
		endPoint => !END_POINT_PROTECTED.POST.includes(endPoint),
	),
	DELETE: Object.values(END_POINT).filter(
		endPoint => !END_POINT_PROTECTED.DELETE.includes(endPoint),
	),
}

export const POST_STATUS_MAP = [
	WP_Post_Status_Name.auto_draft,
	WP_Post_Status_Name.draft,
	WP_Post_Status_Name.future,
	WP_Post_Status_Name.inherit,
	WP_Post_Status_Name.pending,
	WP_Post_Status_Name.private,
	WP_Post_Status_Name.publish,
	WP_Post_Status_Name.trash,
]

export const POST_TYPE_MAP = [
	WP_Post_Type_Name.attachment,
	WP_Post_Type_Name.custom_css,
	WP_Post_Type_Name.customize_changeset,
	WP_Post_Type_Name.nav_menu_item,
	WP_Post_Type_Name.oembed_cache,
	WP_Post_Type_Name.page,
	WP_Post_Type_Name.post,
	WP_Post_Type_Name.revision,
	WP_Post_Type_Name.user_request,
	WP_Post_Type_Name.wp_block,
]
