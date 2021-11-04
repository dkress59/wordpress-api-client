import {
	DefaultEndpoint,
	DefaultEndpointWithRevision,
	RenderedBlockDto,
} from '.'
import { END_POINT, ERROR_MESSAGE } from './constants'
import {
	EndpointCreate,
	EndpointDelete,
	EndpointFind,
	EndpointFindOnly,
	EndpointUpdate,
	EndpointUpdatePartial,
	WPCategory,
	WPComment,
	WPCreate,
	WPMedia,
	WPPage,
	WPPlugin,
	WPPost,
	WPTag,
	WPTaxonomy,
	WPTheme,
	WPUser,
} from './types'
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
import { getDefaultQueryList, getDefaultQuerySingle } from './util'

interface PostCollection<P = any> {
	postType: WP_Post_Type_Name | string
	posts: P[]
}

export class WpApiClient {
	protected readonly axios: FetchClient

	constructor(
		baseURL: string,
		options?: {
			auth?: 'basic' | 'jwt'
			onError?: (message: string) => void
			protected?: string[]
			public?: string[]
		},
	) {
		this.axios = new FetchClient(
			new URL('wp-json', baseURL),
			undefined,
			options?.onError,
		)
	}

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
					(await this.axios.get<P[] | undefined>(
						`${endpoint}/${getDefaultQueryList(query)}`,
					)) ?? ([] as P[])
			} else {
				result = await Promise.all(
					ids.map(postId =>
						this.axios.get<P>(
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
	): (body: WPCreate<P>, id?: number) => Promise<P> {
		return async (body: WPCreate<P>, id = 0) => {
			if (id)
				return await this.axios.post<P>(
					`${endpoint}/${id}`,
					undefined,
					JSON.stringify({
						...body,
						fields: body.acf,
					}),
				)
			else
				return await this.axios.post<P>(
					`${endpoint}`,
					undefined,
					JSON.stringify({
						...body,
						fields: body.acf,
					}),
				)
		}
	}

	protected createEndpointDelete<P>(endpoint: string): EndpointDelete<P> {
		return async (...ids: number[]) => {
			if (!ids.length) throw new Error(ERROR_MESSAGE.ID_REQUIRED)
			return await Promise.all(
				ids.map(id => this.axios.delete<P>(`${endpoint}/${id}`)),
			)
		}
	}

	protected createEndpointCustomGet<T, R = null>(
		endPoint: string,
	): () => Promise<T | R> {
		return async (): Promise<T | R> => {
			return await this.axios.get<T>(endPoint)
		}
	}

	protected createEndpointCustomPost<T, R = null>(
		endPoint: string,
	): (body: T) => Promise<T | R> {
		return async (body: T): Promise<T | R> => {
			return await this.axios.post<T>(
				endPoint,
				undefined,
				JSON.stringify(body),
			)
		}
	}

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

	public post<P = WPPost>(): DefaultEndpointWithRevision<P> {
		return this.addPostType<P>(END_POINT.POSTS, true)
	}

	public page<P = WPPage>(): DefaultEndpointWithRevision<P> {
		return this.addPostType<P>(END_POINT.PAGES, true)
	}

	public comment<P = WPComment>(): DefaultEndpoint<P> {
		return this.addPostType<P>(END_POINT.COMMENTS, false)
	}

	public postCategory<P = WPCategory>(): DefaultEndpoint<P> {
		return this.addPostType<P>(END_POINT.CATEGORIES, false)
	}

	public postTag<P = WPTag>(): DefaultEndpoint<P> {
		return this.addPostType<P>(END_POINT.TAGS, false)
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
			return await this.axios.post<P>(
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

	public user<P = WPUser>(): {
		find: EndpointFind<P>
		findMe: EndpointFindOnly<P>
		create: EndpointCreate<P>
		update: EndpointUpdate<P>
		delete: EndpointDelete<P>
		deleteMe: EndpointFindOnly<P>
	} {
		const findMe = async () =>
			await this.axios.get<P>(END_POINT.USERS + '/me')
		const deleteMe = async () =>
			await this.axios.delete<P>(END_POINT.USERS + '/me')
		return {
			...this.addPostType<P>(END_POINT.USERS),
			findMe: findMe as EndpointFindOnly<P>,
			deleteMe,
		}
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
		return await this.axios.get<S[]>(`${END_POINT.SEARCH}/?${query}`)
	}

	public async postType<P = WP_REST_API_Type>(): Promise<P[]>
	public async postType<P = WP_REST_API_Type>(
		postType: WP_Post_Type_Name | string,
	): Promise<P>
	public async postType<P = WP_REST_API_Type>(
		postType?: WP_Post_Type_Name | string,
	): Promise<P | P[]> {
		return postType
			? await this.axios.get<P>(`${END_POINT.TYPES}/type/${postType}`)
			: await this.axios.get<P[]>(END_POINT.TYPES)
	}

	public async status<P = WP_REST_API_Status>(): Promise<P[]>
	public async status<P = WP_REST_API_Status>(
		status: WP_Post_Type_Name | string,
	): Promise<P>
	public async status<P = WP_REST_API_Status>(
		status?: WP_Post_Type_Name | string,
	): Promise<P | P[]> {
		return status
			? await this.axios.get<P>(`${END_POINT.STATUSES}/${status}`)
			: await this.axios.get<P[]>(END_POINT.STATUSES)
	}

	public async blockType<P = WP_REST_API_Block_Type>(): Promise<P[]>
	public async blockType<P = WP_REST_API_Block_Type>(
		blockType: WP_Post_Type_Name | string,
	): Promise<P>
	public async blockType<P = WP_REST_API_Block_Type>(
		blockType?: WP_Post_Type_Name | string,
	): Promise<P | P[]> {
		return blockType
			? await this.axios.get<P>(`${END_POINT.BLOCK_TYPES}/${blockType}`)
			: await this.axios.get<P[]>(END_POINT.BLOCK_TYPES)
	}

	public async blockDirectory<
		P = WP_REST_API_Block_Directory_Item,
	>(): Promise<P | P[]> {
		return await this.axios.get<P[]>(END_POINT.BLOCK_DIRECTORY)
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
				await this.axios.post<P>(
					END_POINT.PLUGINS,
					undefined,
					JSON.stringify({
						slug: plugin,
						status,
					}),
				),
			find: async (plugin = '') =>
				plugin
					? [
							await this.axios.get<P>(
								`${END_POINT.PLUGINS}/${plugin}`,
							),
					  ]
					: await this.axios.get<P[]>(`${END_POINT.PLUGINS}`),
			update: async (
				plugin: string,
				status: 'active' | 'inactive' = 'inactive',
				context: 'view' | 'embed' | 'edit' = 'view',
			) =>
				await this.axios.post<P>(
					`${END_POINT.PLUGINS}/${plugin}`,
					undefined,
					JSON.stringify({
						context,
						status,
					}),
				),
			delete: async (plugin: string) =>
				await this.axios.delete<P>(`${END_POINT.PLUGINS}/${plugin}`),
		}
	}

	public reusableBlock<P = WP_REST_API_Block>(): DefaultEndpoint<P> {
		return this.addPostType<P>(END_POINT.EDITOR_BLOCKS, false)
	}

	public taxonomy<P = WPTaxonomy>(): DefaultEndpoint<P> {
		return this.addPostType<P>(END_POINT.TAXONOMIES, false)
	}

	public async renderedBlock<P = WP_REST_API_Rendered_Block>(
		params: RenderedBlockDto,
	): Promise<P> {
		return await this.axios.post<P>(
			`${END_POINT.BLOCK_RENDERER}/${params.name}`,
			undefined,
			JSON.stringify({
				name: params.name,
				post_id: params.postId,
				attributes: params.attributes ?? [],
				context: params.context ?? 'view',
			}),
		)
	}

	public async theme<P = WPTheme>(): Promise<P[]> {
		return await this.axios.get<P[]>(END_POINT.THEMES)
	}
}
