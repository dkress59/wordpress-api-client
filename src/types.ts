export type WPCreate<W> = Record<string, unknown> &
	Partial<
		{ content: string; excerpt: string; title: string } & Omit<
			Omit<Omit<Omit<W, 'content'>, 'excerpt'>, 'id'>,
			'title'
		>
	>

export type EndpointCreate<P> = (body: WPCreate<P>) => Promise<P | null>
export type EndpointUpdate<P> = (
	body: WPCreate<P>,
	id: number,
) => Promise<P | null>

export enum WPPostStatus {
	PUBLISH = 'publish',
	DRAFT = 'draft',
	PRIVATE = 'private',
	PENDING = 'pending',
	FUTURE = 'future',
}

export enum WPCommentStaus {
	CLOSED = 'closed',
	OPEN = 'open',
}

export enum WPPostType {
	POST = 'post',
	PAGE = 'page',
	ATTACHMENT = 'attachment',
	REVISION = 'revision',
	NAV_MENU_ITEM = 'nav_menu_item',
	CUSTOM_CSS = 'custom_css',
	CUSTOMIZE_CHANGESET = 'customize_changeset',
	OEMBED_CACHE = 'oembed_cache',
	USER_REQUEST = 'user_request',
	WP_BLOCK = 'wp_block',
}

export interface WPMediaSize {
	file: string // filename
	width: number
	height: number
	mime_type: string | 'image/jpeg' | 'image/jeg' | 'image/png'
	source_url: string
}

export interface WPMetaEmbedLink {
	embeddable?: boolean
	href: string
}

export interface WPMetaEmbed {
	'wp:featuredmedia': [
		{
			id: number
			date: string
			slug: string
			type: string
			link: string
			title: {
				rendered: string
			}
			author: number
			acf: unknown
			caption: {
				rendered: string
			}
			alt_text: string
			media_type: string
			mime_type: string
			media_details: {
				width: number
				height: number
				file: string
				sizes: {
					'medium': WPMediaSize
					'large': WPMediaSize
					'thumbnail': WPMediaSize
					'medium_large': WPMediaSize
					'1536x1536': WPMediaSize
					'2048x2048': WPMediaSize
					'full': WPMediaSize
				}
				image_meta: {
					aperture: string
					credit: string
					camera: string
					caption: string
					created_timestamp: string
					copyright: string
					focal_length: string
					iso: string
					shutter_speed: string
					title: string
					orientation: string
					keywords: []
				}
				original_image: string
			}
			source_url: string
			_links: {
				self: WPMetaEmbedLink[]
				collection: WPMetaEmbedLink[]
				about: WPMetaEmbedLink[]
				author: WPMetaEmbedLink[]
				replies: WPMetaEmbedLink[]
			}
		},
	]
}

interface WPMetaLinks {
	'self': { href: string }[]
	'collection': { href: string }[]
	'about': { href: string }[]
	'author': {
		embeddable: boolean
		href: string
	}[]
	'replies': {
		embeddable: boolean
		href: string
	}[]
	'version-history': {
		count: number
		href: string
	}[]
	'predecessor-version': {
		id: number
		href: string
	}[]
	'wp:featuredmedia': {
		embeddable: boolean
		href: string
	}[]
	'wp:attachment': { href: string }[]
	'wp:term': {
		taxonomy: string
		embeddable: boolean
		href: string
	}[]
	'curies': {
		name: string
		href: string
		templated: boolean
	}[]
}

export interface WPPost {
	id: number
	date: string
	date_gmt: string
	guid: {
		rendered: string
	}
	modified: string
	modified_gmt: string
	slug: string
	status: WPPostStatus | string
	type: WPPostType | string
	link: string
	title: {
		// !! CPT: supports
		raw?: string // only in 'edit' context
		rendered: string
	}
	content: {
		// !! CPT: supports
		raw?: string // only in 'edit' context
		rendered: string
		protected: boolean
	}
	excerpt: {
		// !! CPT: supports
		raw?: string // only in 'edit' context
		rendered: string
		protected: boolean
	}
	author: number // !! CPT: supports
	featured_media: number // !! CPT: supports
	comment_status: WPCommentStaus | string
	ping_status: WPCommentStaus | string
	sticky: boolean
	template: string
	format: string // !! CPT: supports
	meta: unknown[] // ??
	categories: number[]
	tags: number[]
	acf?: unknown
	_links: WPMetaLinks
	_embedded?: WPMetaEmbed
}

export interface WPMedia {
	date: string
	date_gmt: string
	guid: {
		raw?: string
		rendered: string
	}
	id: number
	link: string
	modified: string
	modified_gmt: string
	slug: string
	status: WPPostStatus | string
	type: WPPostType.ATTACHMENT
	alt_text: string
	caption: {
		raw?: string
		rendered: string
	}
	description: {
		raw?: string
		rendered: string
	}
	media_type: string
	media_details: Record<string, unknown>
	post: number
	source_url: string
	missing_image_sizes: string[]
	permalink_template?: string
	generated_slug?: string
	title: {
		raw?: string
		rendered: string
	}
	author: number
	comment_status: WPCommentStaus
	ping_status: WPCommentStaus
	meta: [] | Record<string, unknown>
	template: string
	_links: WPMetaLinks
	_embedded?: WPMetaEmbed
	[k: string]: unknown
}

export interface WPPage
	extends Omit<Omit<Omit<WPPost, 'categories'>, 'sticky'>, 'tags'> {
	parent: number
}

export interface WPTaxonomy {
	capabilities?: {
		manage_terms: string[]
		edit_terms: string[]
		delete_terms: string[]
		assign_terms: string[]
	}
	description: string
	hierarchical: boolean
	labels?: {
		name: string
		singular_name: string
		search_items: string
		popular_items: string | null
		all_items: string
		archives?: string
		parent_item: string | null
		parent_item_colon: string | null
		edit_item: string
		view_item: string
		update_item: string
		add_new_item: string
		new_item_name: string
		separate_items_with_commas: string | null
		add_or_remove_items: string | null
		choose_from_most_used: string | null
		not_found: string
		no_terms: string
		filter_by_item: string | null
		items_list_navigation: string
		items_list: string
		most_used: string
		back_to_items: string
		item_link: string
		item_link_description: string
		menu_name: string
		name_admin_bar: string
	}
	name: string
	slug: 'category' | 'post_tag' | 'nav_menu' | 'post_format' | string
	show_cloud?: boolean
	types: (WPPostType | string)[]
	rest_base: string
	visibility?: {
		public: boolean
		publicly_queryable: boolean
		show_ui: boolean
		show_admin_column: boolean
		show_in_nav_menus: boolean
		show_in_quick_edit: boolean
	}
	_links: WPMetaLinks
	[k: string]: unknown
}
