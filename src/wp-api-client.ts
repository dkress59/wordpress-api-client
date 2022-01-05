import { AUTH_TYPE, WpRestApiContext } from '.'
import {
	DefaultEndpoint,
	DefaultEndpointWithRevision,
	EndpointCreate,
	EndpointDelete,
	EndpointFind,
	EndpointFindOnly,
	EndpointUpdate,
	EndpointUpdatePartial,
	RenderedBlockDto,
	WPCategory,
	WPComment,
	WPMedia,
	WPPage,
	WPPlugin,
	WPPost,
	WPTag,
	WPTheme,
	WPUser,
	WpApiOptions,
} from './types'
import {
	END_POINT,
	END_POINT_PROTECTED,
	ERROR_MESSAGE,
	TRASHABLE,
} from './constants'
import { FetchClient } from './fetch-client'
import { URLSearchParams } from 'url'
import {
	WP_Post_Type_Name,
	WP_REST_API_Application_Password,
	WP_REST_API_Block,
	WP_REST_API_Block_Directory_Item,
	WP_REST_API_Block_Type,
	WP_REST_API_Rendered_Block,
	WP_REST_API_Search_Result,
	WP_REST_API_Settings,
	WP_REST_API_Status,
	WP_REST_API_Taxonomy,
	WP_REST_API_Type,
} from 'wp-types'
import { getDefaultQueryList, getDefaultQuerySingle, postCreate } from './util'
import { isRecord, isString } from '@tool-belt/type-predicates'

export class WpApiClient {
	protected readonly authHeader?:
		| { Authorization: string }
		| { 'X-WP-Nonce': string }
	protected readonly headers?: Record<string, string>
	protected readonly http: FetchClient
	protected readonly baseUrl: URL

	constructor(
		baseUrl: string,
		protected readonly options: WpApiOptions = {
			auth: { type: AUTH_TYPE.NONE },
			protected: END_POINT_PROTECTED,
		},
	) {
		if (options.auth?.type === AUTH_TYPE.BASIC) {
			const authString = `${options.auth.username}:${options.auth.password}`
			this.authHeader = {
				Authorization: `Basic ${Buffer.from(authString).toString(
					'base64',
				)}`,
			}
		}
		if (options.auth?.type === AUTH_TYPE.JWT)
			this.authHeader = {
				Authorization: `Bearer ${options.auth.token}`,
			}
		if (options.auth?.type === AUTH_TYPE.NONCE)
			this.authHeader = {
				'X-WP-Nonce': options.auth.nonce,
			}
		this.baseUrl = new URL(options.restBase ?? 'wp-json', baseUrl)
		this.headers = options.headers
		this.http = new FetchClient(
			this.baseUrl,
			options.onError,
			this.headers,
			this.authHeader,
			options.protected,
			options.public,
			options.auth?.type as AUTH_TYPE | undefined,
		)
	}

	// PROTECTED

	protected createEndpointGet<P>(
		endpoint: string,
		defaultQuery = new URLSearchParams(),
	): EndpointFind<P> {
		return async (query?: URLSearchParams | number, ...ids: number[]) => {
			ids = typeof query === 'number' ? [query, ...ids] : ids
			query =
				typeof query === 'number'
					? defaultQuery
					: new URLSearchParams({
							...Object.fromEntries(defaultQuery),
							...Object.fromEntries(query ?? defaultQuery),
					  })
			let result: P[] = []
			if (!ids.length) {
				result = await this.http.getAll<P>(
					`${endpoint}/${getDefaultQueryList(query)}`,
				)
			} else {
				result = await Promise.all(
					ids.map(postId =>
						this.http.get<P>(
							`${endpoint}/${postId}/${getDefaultQuerySingle(
								query as undefined | URLSearchParams,
							)}`,
						),
					),
				)
			}

			return result
		}
	}

	protected createEndpointPost<P>(
		endpoint: string,
	): (body: Partial<P>, id?: number) => Promise<P> {
		return async (body: Partial<P>, id = 0) => {
			if (id)
				return this.http.post<P>(
					`${endpoint}/${id}`,
					undefined,
					JSON.stringify(
						postCreate<Partial<P>>({
							...body,
						}),
					),
				)
			else
				return this.http.post<P>(
					`${endpoint}`,
					undefined,
					JSON.stringify(
						postCreate<Partial<P>>({
							...body,
						}),
					),
				)
		}
	}

	protected createEndpointDelete<P>(
		endpoint: string,
		params?: URLSearchParams,
	): EndpointDelete<P> {
		const trashable = this.options.trashable
		function getUri(id: number): string {
			const useForce = !(trashable ?? TRASHABLE).includes(endpoint)
			const defaultParams = params ? '/?' + params.toString() : ''
			const forceParam = (params ? '&' : '/?') + 'force=true'
			return `${endpoint}/${id}${defaultParams}${
				useForce ? forceParam : ''
			}`
		}
		return async (...ids: number[]) => {
			if (!ids.length) throw new Error(ERROR_MESSAGE.ID_REQUIRED)
			return Promise.all(ids.map(id => this.http.delete<P>(getUri(id))))
		}
	}

	protected createEndpointCustomGet<T, R = null>(
		endPoint: string,
	): () => Promise<T | R> {
		return async (): Promise<T | R> => {
			return this.http.get<T>(endPoint)
		}
	}

	protected createEndpointCustomPost<T, R = null>(
		endPoint: string,
	): (body: T) => Promise<T | R> {
		return async (body: T): Promise<T | R> => {
			return this.http.post<T>(endPoint, undefined, JSON.stringify(body))
		}
	}

	protected defaultEndpoints<P = WPPost>(
		endpoint: string,
		defaultParams?: URLSearchParams,
	): DefaultEndpoint<P> {
		return {
			find: this.createEndpointGet<P>(endpoint, defaultParams),
			create: this.createEndpointPost<P>(endpoint),
			update: this.createEndpointPost<P>(endpoint),
			delete: this.createEndpointDelete<P>(endpoint),
		}
	}

	protected addPostType<P = WPPost>(
		endpoint: string,
		withRevisions: true,
		defaultParams?: URLSearchParams,
	): DefaultEndpointWithRevision<P>
	protected addPostType<P = WPPost>(
		endpoint: string,
		withRevisions?: false,
		defaultParams?: URLSearchParams,
	): DefaultEndpoint<P>
	protected addPostType<P = WPPost>(
		endpoint: string,
		withRevisions = false,
		defaultParams?: URLSearchParams,
	): {
		find: EndpointFind<P>
		create: EndpointCreate<P>
		delete: EndpointDelete<P>
		update: EndpointUpdate<P>
		revision?: (postId: number) => {
			find: EndpointFind<P>
			create: EndpointCreate<P>
			delete: EndpointDelete<P>
			update: EndpointUpdate<P>
		}
	} {
		return {
			...this.defaultEndpoints(endpoint, defaultParams),
			revision: !withRevisions
				? undefined
				: (postId: number) => ({
						...this.defaultEndpoints(
							`${endpoint}/${postId}/revisions`,
							defaultParams,
						),
				  }),
		}
	}

	// PUBLIC

	public async blockType<P = WP_REST_API_Block_Type>(): Promise<P[]>
	public async blockType<P = WP_REST_API_Block_Type>(
		blockType: WP_Post_Type_Name | string,
	): Promise<P>
	public async blockType<P = WP_REST_API_Block_Type>(
		blockType?: WP_Post_Type_Name | string,
	): Promise<P | P[]> {
		return blockType
			? this.http.get<P>(`${END_POINT.BLOCK_TYPES}/${blockType}`)
			: this.http.get<P[]>(END_POINT.BLOCK_TYPES)
	}

	public async blockDirectory<P = WP_REST_API_Block_Directory_Item>(
		term: string,
		page = 1,
		perPage = 10,
	): Promise<P[]> {
		return this.http.get<P[]>(
			`${END_POINT.BLOCK_DIRECTORY}?${new URLSearchParams({
				page: String(page),
				per_page: String(perPage),
				term,
			}).toString()}`,
		)
	}

	public comment<P = WPComment>(): DefaultEndpoint<P> {
		return this.addPostType<P>(END_POINT.COMMENTS, false)
	}

	public media<P extends WPMedia>(): {
		find: EndpointFind<P>
		create: (
			fileName: string,
			file: Buffer,
			mimeType?: string,
			data?: Partial<P>,
		) => Promise<P>
		delete: EndpointDelete<P>
		update: EndpointUpdate<P>
	} {
		const find = this.createEndpointGet<P>(END_POINT.MEDIA)
		const update = this.createEndpointPost<P>(END_POINT.MEDIA)
		/**
		 * @param {string} fileName Must include the file extension
		 * @param {Buffer} file Takes a `Buffer` as input
		 * @param {string} mimeType E.g.: `image/jpeg`
		 * @param {WPMedia} data Optional, populates media library item with a second request
		 * */
		const create = async (
			fileName: string,
			file: Buffer,
			mimeType = 'image/jpeg',
			data?: Partial<P>,
		): Promise<P> => {
			if (!fileName.includes('.'))
				throw new Error(
					ERROR_MESSAGE.INVALID_FILENAME.replace(
						'%fileName%',
						fileName,
					),
				)
			const headers = {
				'Content-Disposition': `attachment; filename="${fileName}"`,
				'Content-Type': mimeType,
			}
			const result = await this.http.post<P>(
				END_POINT.MEDIA,
				headers,
				file,
			)
			if (data) return update(data, result.id)
			return result
		}
		const deleteOne = this.createEndpointDelete<P>(
			END_POINT.MEDIA,
			new URLSearchParams({}),
		)
		return {
			find,
			create,
			delete: deleteOne,
			update,
		}
	}

	public page<P = WPPage>(): DefaultEndpointWithRevision<P> {
		return this.addPostType<P>(END_POINT.PAGES, true)
	}

	public plugin<P = WPPlugin>(): {
		create: (plugin: string, status?: 'active' | 'inactive') => Promise<P>
		find: (plugin?: string) => Promise<P[]>
		update: (
			plugin: string,
			status?: 'active' | 'inactive',
			context?: WpRestApiContext,
		) => Promise<P>
		delete: (plugin: string) => Promise<P>
	} {
		return {
			create: async (plugin: string, status = 'inactive') =>
				this.http.post<P>(
					END_POINT.PLUGINS,
					undefined,
					JSON.stringify({
						slug: plugin,
						status,
					}),
				),
			find: async (plugin = '') =>
				plugin
					? [await this.http.get<P>(`${END_POINT.PLUGINS}/${plugin}`)]
					: await this.http.get<P[]>(`${END_POINT.PLUGINS}`),
			update: async (
				plugin: string,
				status: 'active' | 'inactive' = 'inactive',
				context: WpRestApiContext = 'view',
			) =>
				this.http.post<P>(
					`${END_POINT.PLUGINS}/${plugin}?status=${status}&context=${context}`,
				),
			delete: async (plugin: string) =>
				this.http.delete<P>(`${END_POINT.PLUGINS}/${plugin}`),
		}
	}

	public post<P = WPPost>(): DefaultEndpointWithRevision<P> {
		return this.addPostType<P>(END_POINT.POSTS, true)
	}

	public postCategory<P = WPCategory>(): DefaultEndpoint<P> {
		const deleteOne = this.createEndpointDelete<P>(
			END_POINT.CATEGORIES,
			new URLSearchParams({}),
		)
		return {
			...this.addPostType<P>(END_POINT.CATEGORIES, false),
			delete: deleteOne,
		}
	}

	public postTag<P = WPTag>(): DefaultEndpoint<P> {
		const deleteOne = this.createEndpointDelete<P>(
			END_POINT.TAGS,
			new URLSearchParams({}),
		)
		return {
			...this.addPostType<P>(END_POINT.TAGS, false),
			delete: deleteOne,
		}
	}

	public async postType<P = WP_REST_API_Type>(): Promise<P[]>
	public async postType<P = WP_REST_API_Type>(
		postType: WP_Post_Type_Name | string,
	): Promise<P>
	public async postType<P = WP_REST_API_Type>(
		postType?: WP_Post_Type_Name | string,
	): Promise<P | P[]> {
		return postType
			? this.http.get<P>(`${END_POINT.TYPES}/type/${postType}`)
			: this.http.get<P[]>(END_POINT.TYPES)
	}

	public async renderedBlock<P = WP_REST_API_Rendered_Block>(
		body: RenderedBlockDto,
	): Promise<P> {
		return this.http.post<P>(
			`${END_POINT.BLOCK_RENDERER}/${body.name}`,
			undefined,
			JSON.stringify({
				name: body.name,
				post_id: body.postId,
				attributes: body.attributes ?? [],
				context: body.context ?? 'view',
			}),
		)
	}

	public reusableBlock<P = WP_REST_API_Block>(): DefaultEndpoint<P> & {
		autosave: (blocktId: number) => {
			create: EndpointCreate<P & { parent: number }>
			find: EndpointFind<P & { parent: number }>
		}
	} {
		return {
			...this.defaultEndpoints(END_POINT.EDITOR_BLOCKS),
			autosave: (blockId: number) => {
				const endpoint = `${END_POINT.EDITOR_BLOCKS}/${blockId}/autosaves`
				return {
					create: this.createEndpointPost(endpoint),
					find: this.createEndpointGet(endpoint),
				}
			},
		}
	}

	public async search<S = WP_REST_API_Search_Result>(
		search?: string,
		params?: Record<string, string> &
			Partial<{
				context: string
				page: string
				per_page: string
				type: string
				subtype: string
			}>,
	): Promise<S[]> {
		if (search) params = { ...(params as Record<string, string>), search }
		const query = new URLSearchParams(params).toString()
		return this.http.get<S[]>(`${END_POINT.SEARCH}/?${query}`)
	}

	public siteSettings<P = WP_REST_API_Settings>(): {
		find: EndpointFindOnly<P>
		update: EndpointUpdatePartial<P>
	} {
		return {
			find: this.createEndpointCustomGet<P, P>(
				END_POINT.SETTINGS,
			) as EndpointFindOnly<P>,
			update: this.createEndpointCustomPost<Partial<P>, P>(
				END_POINT.SETTINGS,
			) as EndpointUpdatePartial<P>,
		}
	}

	public async status<P = WP_REST_API_Status>(): Promise<P[]>
	public async status<P = WP_REST_API_Status>(
		status: WP_Post_Type_Name | string,
	): Promise<P>
	public async status<P = WP_REST_API_Status>(
		status?: WP_Post_Type_Name | string,
	): Promise<P | P[]> {
		return status
			? this.http.get<P>(`${END_POINT.STATUSES}/${status}`)
			: this.http.get<P[]>(END_POINT.STATUSES)
	}

	public user<P = WPUser>(): {
		find: EndpointFind<P>
		findMe: EndpointFindOnly<P>
		create: (
			body: Partial<P> &
				Required<{ email: string; username: string; password: string }>,
		) => Promise<P | null>
		update: (
			body: Partial<P> & Required<{ password: string }>,
			userId: number,
		) => Promise<P | null>
		delete: (
			reassign: number,
			...userIds: number[]
		) => Promise<(P | null)[]>
		deleteMe: (reassign: number) => Promise<P>
	} {
		const findMe = async () => this.http.get<P>(END_POINT.USERS_ME)
		const deleteUsers = async (reassign: number, ...userIds: number[]) => {
			if (!userIds.length)
				throw new Error(
					ERROR_MESSAGE.MISSING_REQUIRED_PARAM.replace(
						'%PARAM%',
						'"reassign"',
					),
				)
			return Promise.all(
				userIds.map(id =>
					this.http.delete<P>(
						`${END_POINT.USERS}/${String(id)}?${new URLSearchParams(
							{
								force: String(true),
								reassign: String(reassign),
							},
						).toString()}`,
					),
				),
			)
		}
		const deleteMe = async (reassign: number) =>
			this.http.delete<P>(
				`${END_POINT.USERS_ME}?${new URLSearchParams({
					force: String(true),
					reassign: String(reassign),
				}).toString()}`,
			)
		return {
			...this.addPostType<P>(END_POINT.USERS),
			findMe,
			delete: deleteUsers,
			deleteMe,
		}
	}

	public async taxonomy<P = WP_REST_API_Taxonomy>(
		query: { context?: 'edit' | 'embed' | 'view'; type?: string },
		...slugs: string[]
	): Promise<P[]>
	public async taxonomy<P = WP_REST_API_Taxonomy>(
		...slugs: string[]
	): Promise<P[]>
	public async taxonomy<P = WP_REST_API_Taxonomy>(
		query?: { context?: 'edit' | 'embed' | 'view'; type?: string } | string,
		...slugs: string[]
	): Promise<P[]> {
		slugs = isString(query) ? [query, ...slugs] : slugs
		query = isRecord(query) ? query : undefined
		if (!slugs.length) {
			return (
				(await this.http.get<P[] | undefined>(
					`${END_POINT.TAXONOMIES}/${getDefaultQueryList(
						new URLSearchParams(query),
					)}`,
				)) ?? ([] as P[])
			)
		} else {
			return Promise.all(
				slugs.map(slug =>
					this.http.get<P>(
						`${
							END_POINT.TAXONOMIES
						}/${slug}/${getDefaultQuerySingle(
							isRecord(query)
								? new URLSearchParams(query)
								: undefined,
						)}`,
					),
				),
			)
		}
	}

	public async theme<P = WPTheme>(): Promise<P[]> {
		return this.http.get<P[]>(END_POINT.THEMES)
	}

	public applicationPassword() {
		const find = async (
			userId: number,
			uuids: string[] = [],
		): Promise<WP_REST_API_Application_Password[]> => {
			const endpoint = `${END_POINT.USERS}/${String(userId)}/${
				END_POINT.USER_APPLICATION_PASSWORDS
			}`
			if (!uuids.length) {
				return this.http.get<WP_REST_API_Application_Password[]>(
					endpoint,
				)
			}
			return Promise.all(
				uuids.map(async uuid =>
					this.http.get<WP_REST_API_Application_Password>(
						`${endpoint}/${uuid}`,
					),
				),
			)
		}
		const create = async (
			userId: number,
			appId: string,
			name: string,
		): Promise<Required<WP_REST_API_Application_Password>> => {
			const endpoint = `${END_POINT.USERS}/${String(userId)}/${
				END_POINT.USER_APPLICATION_PASSWORDS
			}`
			return this.http.post<Required<WP_REST_API_Application_Password>>(
				`${endpoint}?${new URLSearchParams({
					app_id: appId,
					name,
				}).toString()}`,
			)
		}
		const update = async (
			userId: number,
			uuid: string,
			appId?: string,
			name?: string,
		): Promise<WP_REST_API_Application_Password> => {
			const endpoint = `${END_POINT.USERS}/${String(userId)}/${
				END_POINT.USER_APPLICATION_PASSWORDS
			}/${uuid}`
			const params = new Map()
			if (name) params.set('name', name)
			if (appId) params.set('app_id', appId)
			return this.http.post<WP_REST_API_Application_Password>(
				endpoint + '?' + new URLSearchParams(params).toString(),
			)
		}
		const deleteOne = async (userId: number, uuid: string) => {
			const endpoint = `${END_POINT.USERS}/${String(userId)}/${
				END_POINT.USER_APPLICATION_PASSWORDS
			}/${uuid}`
			return this.http.delete(endpoint)
		}
		return {
			create,
			delete: deleteOne,
			find,
			update,
		}
	}
}
