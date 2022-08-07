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

export type EndpointFind<P> = (
	query?: URLSearchParams | number,
	...ids: number[]
) => Promise<(P | null)[]>

export type EndpointFindAll<P> = (query?: URLSearchParams) => Promise<P[]>

export type EndpointFindOnly<P> = () => Promise<P>

export type EndpointCreate<P> = (body: Partial<P>) => Promise<P | null>

export type EndpointDelete<P> = (...ids: number[]) => Promise<(P | null)[]>

export type EndpointDeleteUntrashable<P> = (
	...ids: number[]
) => Promise<({ deleted: boolean; previous: P } | null)[]>

export type EndpointUpdate<P> = (
	body: Partial<P>,
	id: number,
) => Promise<P | null>

export type EndpointUpdateMedia<P> = (
	body: Partial<Omit<P, 'caption'> & { caption?: string }>,
	id: number,
) => Promise<P | null>
export type EndpointTotal = () => Promise<number>

export type EndpointUpdatePartial<P> = (body: Partial<P>) => Promise<P>

export interface DefaultEndpoint<P = WPPost> {
	create: EndpointCreate<P>
	find: EndpointFind<P>
	update: EndpointUpdate<P>
	delete: EndpointDelete<P>
	dangerouslyFindAll: EndpointFindAll<P>
	total: EndpointTotal
}

export interface DefaultEndpointWithRevision<P = WPPost> {
	create: EndpointCreate<P>
	find: EndpointFind<P>
	update: EndpointUpdate<P>
	delete: EndpointDelete<P>
	dangerouslyFindAll: EndpointFindAll<P>
	total: EndpointTotal
	revision: (postId: number) => {
		// WP_REST_API_Revision
		create: EndpointCreate<P>
		find: EndpointFind<P>
		update: EndpointUpdate<P>
		delete: EndpointDelete<P>
	}
}

export interface ACFBase<A = unknown> {
	acf: A
}

export interface YoastBase {
	yoast_head_json?: YoastHead
}

// ToDo: Omit<WP_REST_API_Post, 'menu_order'>
export type WPPost<A = unknown> = WP_REST_API_Post & ACFBase<A> & YoastBase

export type WPMedia<A = unknown> = WP_REST_API_Attachment &
	ACFBase<A> &
	YoastBase

// ToDo: Fix Omit<> type hinting
export type WPPage<A = unknown> /* Omit< */ = WPPost<A> /* ,
	'categories' | 'sticky' | 'tags'
> */ & { menu_order: number; parent: number }

export type WPTaxonomy<A = unknown> = WP_REST_API_Taxonomy &
	ACFBase<A> &
	YoastBase

export type WPCategory<A = unknown> = WP_REST_API_Category &
	ACFBase<A> &
	YoastBase

export type WPComment<A = unknown> = WP_REST_API_Comment &
	ACFBase<A> &
	YoastBase

export type WPTag<A = unknown> = WP_REST_API_Tag & ACFBase<A> & YoastBase

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

export type WpRestApiContext = 'view' | 'embed' | 'edit'

export interface PluginCreateDto {
	plugin: string
	status?: 'active' | 'inactive'
}

export interface PluginUpdateDto {
	status?: 'active' | 'inactive'
	context?: WpRestApiContext
}

export interface RenderedBlockDto {
	name: string
	postId: number
	context?: 'edit' | 'view'
	attributes?: string[]
}

export enum AUTH_TYPE {
	BASIC = 'basic',
	JWT = 'jwt',
	NONCE = 'nonce',
	NONE = 'none',
}

interface AuthOptionBasic {
	type: AUTH_TYPE.BASIC | 'basic'
	username: string
	password: string
}
interface AuthOptionJwt {
	type: AUTH_TYPE.JWT | 'jwt'
	token: string
}
interface AuthOptionNonce {
	type: AUTH_TYPE.NONCE | 'nonce'
	nonce: string
}
interface AuthOptionNone {
	type: AUTH_TYPE.NONE | 'none'
}

type AuthOptions =
	| AuthOptionBasic
	| AuthOptionJwt
	| AuthOptionNonce
	| AuthOptionNone

export interface WpApiOptions {
	auth?: AuthOptions
	headers?: Record<string, string>
	onError?: (message: string) => Promise<void>
	protected?: BlackWhiteList
	public?: BlackWhiteList
	restBase?: string
	trashable?: string[]
}

export interface BlackWhiteList {
	GET: string[]
	POST: string[]
	DELETE: string[]
}

export interface YoastHead {
	title: string
	robots: YoastRobots
	og_locale: string
	og_type: string
	og_title: string
	og_description: string
	og_url: string
	og_site_name: string
	article_modified_time?: Date
	article_published_time: Date
	og_image?: {
		width: number
		height: number
		url: string
		type: string
	}[]
	twitter_card: string
	twitter_misc: YoastTwitterMisc
	schema: YoastSchema
}

export interface YoastRobots {
	'index': string
	'follow': string
	'max-snippet': string
	'max-image-preview': string
	'max-video-preview': string
}

export interface YoastSchema {
	'@context': string
	'@graph': YoastGraph[]
}

export interface YoastGraph {
	'@type': string
	'@id': string
	'url'?: string
	'name'?: string
	'description'?: string
	'potentialAction'?: YoastPotentialAction[]
	'inLanguage'?: string
	'isPartOf'?: YoastAuthor
	'datePublished'?: Date
	'dateModified'?: Date
	'author'?: YoastAuthor
	'breadcrumb'?: YoastAuthor
	'itemListElement'?: YoastItemListElement[]
	'image'?: YoastImage
	'sameAs'?: string[]
}

export interface YoastAuthor {
	'@id': string
}

export interface YoastImage {
	'@type': string
	'@id': string
	'inLanguage': string
	'url': string
	'contentUrl': string
	'caption': string
}

export interface YoastItemListElement {
	'@type': string
	'position': number
	'name': string
	'item'?: string
}

export interface YoastPotentialAction {
	'@type': string
	'target': string[] | YoastTargetClass
	'query-input'?: string
}

export interface YoastTargetClass {
	'@type': string
	'urlTemplate': string
}

export interface YoastTwitterMisc {
	'Written by': string
}
