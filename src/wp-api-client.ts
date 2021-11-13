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
	WPTaxonomy,
	WPTheme,
	WPUser,
	WpApiOptions,
} from './types'
import { END_POINT, END_POINT_PROTECTED, ERROR_MESSAGE } from './constants'
import { FetchClient } from './fetch-client'
import { POST_TYPE_MAP } from './factories'
import { URLSearchParams } from 'url'
import {
	WP_Post_Type_Name,
	WP_REST_API_Block,
	WP_REST_API_Block_Directory_Item,
	WP_REST_API_Block_Type,
	WP_REST_API_Rendered_Block,
	WP_REST_API_Search_Result,
	WP_REST_API_Settings,
	WP_REST_API_Status,
	WP_REST_API_Type,
} from 'wp-types'
import { getDefaultQueryList, getDefaultQuerySingle, postCreate } from './util'

interface PostCollection<P = any> {
	postType: WP_Post_Type_Name | string
	posts: P[]
}

export class WpApiClient {
	protected readonly authHeader?:
		| { Authorization: string }
		| { 'X-WP-Nonce': string }
	protected readonly headers?: Record<string, string>
	protected readonly http: FetchClient
	protected readonly baseUrl?: URL

	constructor(
		baseUrl: string,
		options: WpApiOptions = {
			auth: { type: 'none' },
			protected: END_POINT_PROTECTED,
		},
	) {
		if (options.auth?.type === 'basic')
			this.authHeader = {
				Authorization: `Basic ${Buffer.from(
					options.auth.username + ':' + options.auth.password,
				).toString('base64')}`,
			}
		if (options.auth?.type === 'jwt')
			this.authHeader = {
				Authorization: `Bearer ${options.auth.token}`,
			}
		if (options.auth?.type === 'nonce')
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
		)
	}

	// STATIC

	protected static collection: PostCollection[] = POST_TYPE_MAP.map(
		postType => ({
			postType,
			posts: [],
		}),
	)

	public static addCollection(...postTypes: string[]): void {
		postTypes.forEach(postType =>
			WpApiClient.collection.push({
				postType,
				posts: [],
			}),
		)
	}

	public static clearCollection(...postTypes: string[]): void {
		WpApiClient.collection = WpApiClient.collection.map(collection => ({
			...collection,
			posts:
				!postTypes.length || postTypes.includes(collection.postType)
					? []
					: collection.posts,
		}))
	}

	public static collect<P = WPPost>(
		postType: WP_Post_Type_Name | string,
	): P[] | undefined {
		return WpApiClient.collection.find(
			collection => collection.postType === postType,
		)?.posts as undefined | P[]
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
				result =
					(await this.http.get<P[] | undefined>(
						`${endpoint}/${getDefaultQueryList(query)}`,
					)) ?? ([] as P[])
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
			const postType =
				result.length && !!result[0]
					? (Reflect.get(
							result[0] as Record<string, unknown>,
							'type',
					  ) as string)
					: null
			if (postType)
				WpApiClient.collection
					.find(collection => collection.postType === postType)
					?.posts.push(...result)
			return result
		}
	}

	protected createEndpointPost<P>(
		endpoint: string,
	): (body: Partial<P>, id?: number) => Promise<P> {
		return async (body: Partial<P>, id = 0) => {
			if (id)
				return await this.http.post<P>(
					`${endpoint}/${id}`,
					undefined,
					JSON.stringify(
						postCreate<Partial<P>>({
							...body,
						}),
					),
				)
			else
				return await this.http.post<P>(
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

	protected createEndpointDelete<P>(endpoint: string): EndpointDelete<P> {
		return async (...ids: number[]) => {
			if (!ids.length) throw new Error(ERROR_MESSAGE.ID_REQUIRED)
			return await Promise.all(
				ids.map(id => this.http.delete<P>(`${endpoint}/${id}`)),
			)
		}
	}

	protected createEndpointCustomGet<T, R = null>(
		endPoint: string,
	): () => Promise<T | R> {
		return async (): Promise<T | R> => {
			return await this.http.get<T>(endPoint)
		}
	}

	protected createEndpointCustomPost<T, R = null>(
		endPoint: string,
	): (body: T) => Promise<T | R> {
		return async (body: T): Promise<T | R> => {
			return await this.http.post<T>(
				endPoint,
				undefined,
				JSON.stringify(body),
			)
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
		withRevisions?: boolean,
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
			? await this.http.get<P>(`${END_POINT.BLOCK_TYPES}/${blockType}`)
			: await this.http.get<P[]>(END_POINT.BLOCK_TYPES)
	}

	public async blockDirectory<
		P = WP_REST_API_Block_Directory_Item,
	>(): Promise<P | P[]> {
		return await this.http.get<P[]>(END_POINT.BLOCK_DIRECTORY)
	}

	public comment<P = WPComment>(): DefaultEndpoint<P> {
		return this.addPostType<P>(END_POINT.COMMENTS, false)
	}

	public media<P = WPMedia>(): {
		find: EndpointFind<P>
		create: (
			fileName: string,
			data: Buffer,
			mimeType?: string,
		) => Promise<P>
		delete: EndpointDelete<P>
		update: EndpointUpdate<P>
	} {
		const find = this.createEndpointGet<P>(END_POINT.MEDIA)
		/**
		 * @param {string} fileName Must include the file extension
		 * @param {Buffer} data Takes a `Buffer` as input
		 * @param {string} mimeType E.g.: `image/jpeg`
		 * */
		const create = async (
			fileName: string,
			data: Buffer,
			mimeType = 'image/jpeg',
		): Promise<P> => {
			if (!fileName.includes('.'))
				throw new Error(
					ERROR_MESSAGE.INVALID_FILENAME.replace(
						'%fileName%',
						fileName,
					),
				)
			return await this.http.post<P>(
				`${END_POINT.MEDIA}`,
				{
					'Content-Type': mimeType,
					'Content-Disposition':
						'application/x-www-form-urlencoded; filename="' +
						fileName +
						'"',
				},
				data,
			)
		}
		const deleteOne = this.createEndpointDelete<P>(END_POINT.MEDIA)
		const update = this.createEndpointPost<P>(END_POINT.MEDIA)
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
			context?: 'view' | 'embed' | 'edit',
		) => Promise<P>
		delete: (plugin: string) => Promise<P>
	} {
		return {
			create: async (plugin: string, status = 'inactive') =>
				await this.http.post<P>(
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
				context: 'view' | 'embed' | 'edit' = 'view',
			) =>
				await this.http.post<P>(
					`${END_POINT.PLUGINS}/${plugin}?status=${status}&context=${context}`,
				),
			delete: async (plugin: string) =>
				await this.http.delete<P>(`${END_POINT.PLUGINS}/${plugin}`),
		}
	}

	public post<P = WPPost>(): DefaultEndpointWithRevision<P> {
		return this.addPostType<P>(END_POINT.POSTS, true)
	}

	public postCategory<P = WPCategory>(): DefaultEndpoint<P> {
		return this.addPostType<P>(END_POINT.CATEGORIES, false)
	}

	public postTag<P = WPTag>(): DefaultEndpoint<P> {
		return this.addPostType<P>(END_POINT.TAGS, false)
	}

	public async postType<P = WP_REST_API_Type>(): Promise<P[]>
	public async postType<P = WP_REST_API_Type>(
		postType: WP_Post_Type_Name | string,
	): Promise<P>
	public async postType<P = WP_REST_API_Type>(
		postType?: WP_Post_Type_Name | string,
	): Promise<P | P[]> {
		return postType
			? await this.http.get<P>(`${END_POINT.TYPES}/type/${postType}`)
			: await this.http.get<P[]>(END_POINT.TYPES)
	}

	public async renderedBlock<P = WP_REST_API_Rendered_Block>(
		body: RenderedBlockDto,
	): Promise<P> {
		return await this.http.post<P>(
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

	public reusableBlock<P = WP_REST_API_Block>(): DefaultEndpoint<P> {
		return this.addPostType<P>(END_POINT.EDITOR_BLOCKS, false)
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
		if (search) params = { ...params, search }
		const query = new URLSearchParams(params).toString()
		return await this.http.get<S[]>(`${END_POINT.SEARCH}/?${query}`)
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
			? await this.http.get<P>(`${END_POINT.STATUSES}/${status}`)
			: await this.http.get<P[]>(END_POINT.STATUSES)
	}

	public user<P = WPUser>(): {
		find: EndpointFind<P>
		findMe: EndpointFindOnly<P>
		create: EndpointCreate<P>
		update: EndpointUpdate<P>
		delete: EndpointDelete<P>
		deleteMe: EndpointFindOnly<P>
	} {
		const findMe = async () => await this.http.get<P>(END_POINT.USERS_ME)
		const deleteMe = async () =>
			await this.http.delete<P>(END_POINT.USERS_ME)
		return {
			...this.addPostType<P>(END_POINT.USERS),
			findMe,
			deleteMe,
		}
	}

	public taxonomy<P = WPTaxonomy>(): DefaultEndpoint<P> {
		return this.addPostType<P>(END_POINT.TAXONOMIES, false)
	}

	public async theme<P = WPTheme>(): Promise<P[]> {
		return await this.http.get<P[]>(END_POINT.THEMES)
	}
}
