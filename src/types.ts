import { URLSearchParams } from 'url'
import {
	WP_REST_API_Attachment,
	WP_REST_API_Category,
	WP_REST_API_Comment,
	WP_REST_API_Post,
	WP_REST_API_Tag,
	WP_REST_API_Taxonomy,
	WP_REST_API_User,
} from 'wp-types'

export type WPCreate<W> = Record<string, unknown> &
	Partial<
		{ content: string; excerpt: string; title: string } & Omit<
			Omit<Omit<Omit<W, 'content'>, 'excerpt'>, 'id'>,
			'title'
		>
	>

export type EndpointFind<P> = (
	query?: URLSearchParams | number,
	...ids: number[]
) => Promise<P[]>

export type EndpointFindOnly<P> = () => Promise<P>

export type EndpointCreate<P> = (body: WPCreate<P>) => Promise<P | null>

export type EndpointDelete<P> = (...ids: number[]) => Promise<(P | null)[]>

export type EndpointUpdate<P> = (
	body: WPCreate<P>,
	id: number,
) => Promise<P | null>

export type EndpointUpdatePartial<P> = (body: Partial<P>) => Promise<P>

export interface DefaultEndpoint<P = WPPost> {
	find: EndpointFind<P>
	create: EndpointCreate<P>
	delete: EndpointDelete<P>
	update: EndpointUpdate<P>
}

export interface DefaultEndpointWithRevision<P = WPPost> {
	find: EndpointFind<P>
	create: EndpointCreate<P>
	delete: EndpointDelete<P>
	update: EndpointUpdate<P>
	revision: (postId: number) => {
		// WP_REST_API_Revision
		find: EndpointFind<P>
		create: EndpointCreate<P>
		delete: EndpointDelete<P>
		update: EndpointUpdate<P>
	}
}

export interface ACFPost {
	ID: number
	post_author: string
	post_date: string
	post_date_gmt: string
	post_content: string
	post_title: string
	post_excerpt: string
	post_status: string
	comment_status: string
	ping_status: string
	post_password: string
	post_name: string
	to_ping: string
	pinged: string
	post_modified: string
	post_modified_gmt: string
	post_content_filtered: string
	post_parent: number
	guid: string
	menu_order: number
	post_type: string
	post_mime_type: string
	comment_count: string
	filter: string
}

export interface ACFMediaSizes {
	'thumbnail': string
	'thumbnail-width': number
	'thumbnail-height': number
	'medium': string
	'medium-width': number
	'medium-height': number
	'medium_large': string
	'medium_large-width': number
	'medium_large-height': number
	'large': string
	'large-width': number
	'large-height': number
	'1536x1536': string
	'1536x1536-width': number
	'1536x1536-height': number
	'2048x2048': string
	'2048x2048-width': number
	'2048x2048-height': number
}

export interface ACFMedia {
	ID: number
	id: number
	title: string
	filename: string
	filesize: number
	url: string
	link: string
	alt: string
	author: string
	description: string
	caption: string
	name: string
	status: string
	uploaded_to: number
	date: string
	modified: string
	menu_order: number
	mime_type: string
	type: string
	subtype: string
	icon: string
	width: number
	height: number
	sizes: ACFMediaSizes
}

export interface ACFBase<A = unknown> {
	acf: A
}

// ToDo: Omit<WP_REST_API_Post, 'menu_order'>
export type WPPost<A = unknown> = WP_REST_API_Post & ACFBase<A>

export type WPMedia<A = unknown> = WP_REST_API_Attachment & ACFBase<A>

// ToDo: Fix Omit<> type hinting
export type WPPage<A = unknown> /* Omit< */ = WPPost<A> /* ,
	'categories' | 'sticky' | 'tags'
> */ & { menu_order: number; parent: number }

export type WPTaxonomy<A = unknown> = WP_REST_API_Taxonomy & ACFBase<A>

export type WPCategory<A = unknown> = WP_REST_API_Category & ACFBase<A>

export type WPComment<A = unknown> = WP_REST_API_Comment & ACFBase<A>

//export type WPSettings<A = unknown> = WP_REST_API_Settings & ACFBase<A>

export type WPTag<A = unknown> = WP_REST_API_Tag & ACFBase<A>

export type WPUser<A = unknown> = WP_REST_API_User & ACFBase<A>

export interface WPPlugin {
	plugin: string
	status: string
	name: string
	plugin_uri: string
	author: string
	author_uri: string
	description: {
		raw: string
		rendered: string
	}
	version: string
	network_only: boolean
	requires_wp: string
	requires_php: string
	textdomain: string
	_links: {
		self?:
			| {
					href: string
			  }[]
			| null
	}
}

export interface WPThemeEditorColor {
	name: string
	slug: string
	color: string
}
export interface WPThemeEditorFontSize {
	name: string
	size: number
	slug: string
}
export interface WPThemeEditorGradientPreset {
	name: string
	gradient: string
	slug: string
}

export interface WPThemeSupports {
	'align-wide': boolean
	'automatic-feed-links': boolean
	'custom-background': {
		'default-image': string
		'default-preset': string
		'default-position-x': string
		'default-position-y': string
		'default-size': string
		'default-repeat': string
		'default-attachment': string
		'default-color': string
	}
	'custom-header': boolean
	'custom-logo': {
		'width': number
		'height': number
		'flex-width': boolean
		'flex-height': boolean
		'header-text'?: (string | null)[]
		'unlink-homepage-logo': boolean
	}
	'customize-selective-refresh-widgets': boolean
	'dark-editor-style': boolean
	'disable-custom-colors': boolean
	'disable-custom-font-sizes': boolean
	'disable-custom-gradients': boolean
	'editor-color-palette'?: WPThemeEditorColor[]
	'editor-font-sizes'?: WPThemeEditorFontSize[]
	'editor-gradient-presets'?: WPThemeEditorGradientPreset[]
	'editor-styles': boolean
	'html5'?: string[]
	'formats'?: string[]
	'post-thumbnails': boolean
	'responsive-embeds': boolean
	'title-tag': boolean
	'wp-block-styles': boolean
}

export interface WPTheme {
	stylesheet: string
	template: string
	requires_php: string
	requires_wp: string
	textdomain: string
	version: string
	screenshot: string
	author: {
		raw: string
		rendered: string
	}
	author_uri: {
		raw: string
		rendered: string
	}
	description: {
		raw: string
		rendered: string
	}
	name: {
		raw: string
		rendered: string
	}
	tags: {
		raw?: (string | null)[]
		rendered: string
	}
	theme_uri: {
		raw: string
		rendered: string
	}
	status: string
	theme_supports?: WPThemeSupports
	_links: {
		self?: {
			href: string
		}[]
		collection?: {
			href: string
		}[]
	}
}

export interface PluginCreateDto {
	plugin: string
	status?: 'active' | 'inactive'
}

export interface PluginUpdateDto {
	status?: 'active' | 'inactive'
	context?: 'view' | 'embed' | 'edit'
}

export interface RenderedBlockDto {
	name: string
	postId: number
	context?: 'edit' | 'view'
	attributes?: string[]
}
