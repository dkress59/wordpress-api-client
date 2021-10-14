import { END_POINT, ERROR_MESSAGE } from './constants'
import {
	EndpointCreate,
	EndpointGetMany,
	EndpointGetOne,
	EndpointUpdate,
	WPCategory,
	WPCreate,
	WPMedia,
	WPPage,
	WPPost,
	WPTag,
	WPUser,
} from './types'
import { POST_TYPE_MAP } from './factories'
import { WP_Post_Type_Name } from 'wp-types'
import {
	getDefaultQueryList,
	getDefaultQuerySingle,
	handleWpApiError,
	validateBaseUrl,
} from './util'
import axios, { AxiosInstance, AxiosResponse } from 'axios'

interface PostCollection<P = any> {
	postType: WP_Post_Type_Name | string
	posts: P[]
}

export class WpApiClient {
	protected readonly axios: AxiosInstance

	constructor(
		baseURL: string,
		onError?: (message: string) => void,
		axiosInstance?: AxiosInstance,
	) {
		this.axios = axiosInstance ?? axios.create()
		this.axios.defaults.baseURL = validateBaseUrl(baseURL) + '/wp-json'
		this.axios.interceptors.response.use(
			config => config,
			error => handleWpApiError(error, onError),
		)
		/* ;WpApiClient.collection =
			POST_TYPE_MAP.map(postType => ({
				postType,
				posts: [],
			})) */
	}

	protected createEndpointGet<P>(
		endpoint: string,
		params?: Record<string, string>,
	): (id: undefined | number | number[]) => Promise<P | P[]> {
		return async (id = 0) => {
			if (!id) {
				const result =
					(
						await this.axios.get<P[] | undefined>(
							`${endpoint}/${getDefaultQueryList(params)}`,
						)
					).data ?? ([] as P[])
				if (!result.length) return result
				const postType = Reflect.get(
					result[0] as unknown as WPPost,
					'type',
				) as string
				WpApiClient.collection
					.find(collection => collection.postType === postType)
					?.posts.push(...result)
				return result
			}
			if (Array.isArray(id)) {
				const result = (
					await Promise.all(
						id.map(postId =>
							this.axios.get<P>(
								`${endpoint}/${postId}/${getDefaultQuerySingle(
									params,
								)}`,
							),
						),
					)
				).map(response => response.data)
				const postType = Reflect.get(
					result[0] as unknown as WPPost,
					'type',
				) as string
				WpApiClient.collection
					.find(collection => collection.postType === postType)
					?.posts.push(...result)
				return result
			}
			const result = (
				await this.axios.get<P>(
					`${endpoint}/${id}/${getDefaultQuerySingle(params)}`,
				)
			).data
			const postType = Reflect.get(
				result as unknown as WPPost,
				'type',
			) as string
			WpApiClient.collection
				.find(collection => collection.postType === postType)
				?.posts.push(result)
			return result
		}
	}

	protected createEndpointPost<P>(
		endpoint: string,
	): (body: WPCreate<P>, id?: number) => Promise<P> {
		return async (body: WPCreate<P>, id = 0) => {
			if (id)
				return (
					await this.axios.post<WPCreate<P>, AxiosResponse<P>>(
						`${endpoint}/${id}`,
						{
							...body,
							fields: body.acf,
						},
					)
				).data
			else
				return (
					await this.axios.post<WPCreate<P>, AxiosResponse<P>>(
						`${endpoint}`,
						{
							...body,
							fields: body.acf,
						},
					)
				).data
		}
	}

	protected createEndpointCustomGet<T, R = null>(
		endPoint: string,
	): () => Promise<T | R> {
		return async (): Promise<T | R> => {
			return (await this.axios.get(endPoint)).data
		}
	}

	protected createEndpointCustomPost<T, R = null>(
		endPoint: string,
	): (body: T) => Promise<T | R> {
		return async (body: T): Promise<T | R> => {
			return (await this.axios.post(endPoint, body)).data
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

	public post<P = WPPost>(): {
		find: EndpointGetMany<P>
		findOne: EndpointGetOne<P>
		create: EndpointCreate<P>
		update: EndpointUpdate<P>
	} {
		const find = this.createEndpointGet<P>(END_POINT.POSTS)
		const create = this.createEndpointPost<P>(END_POINT.POSTS)
		const update = this.createEndpointPost<P>(END_POINT.POSTS)
		return {
			find: find as EndpointGetMany<P>,
			findOne: find as EndpointGetOne<P>,
			create,
			update,
		}
	}

	public page<P = WPPage>(): {
		find: EndpointGetMany<P>
		findOne: EndpointGetOne<P>
		create: EndpointCreate<P>
		update: EndpointUpdate<P>
	} {
		const find = this.createEndpointGet<P>(END_POINT.PAGES)
		const create = this.createEndpointPost<P>(END_POINT.PAGES)
		const update = this.createEndpointPost<P>(END_POINT.PAGES)
		return {
			find: find as EndpointGetMany<P>,
			findOne: find as EndpointGetOne<P>,
			create,
			update,
		}
	}

	public media<P = WPMedia>(): {
		find: EndpointGetMany<P>
		findOne: EndpointGetOne<P>
		create: (
			fileName: string,
			data: Buffer,
			mimeType?: string,
		) => Promise<P>
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
			return (
				await this.axios.post<Buffer, AxiosResponse<P>>(
					`${END_POINT.MEDIA}`,
					data,
					{
						headers: {
							'Content-Type': mimeType,
							'Content-Disposition':
								'application/x-www-form-urlencoded; filename="' +
								fileName +
								'"',
						},
					},
				)
			).data
		}
		const update = this.createEndpointPost<P>(END_POINT.MEDIA)
		return {
			find: find as EndpointGetMany<P>,
			findOne: find as EndpointGetOne<P>,
			create,
			update,
		}
	}

	public postCategory<P = WPCategory>(): {
		find: EndpointGetMany<P>
		findOne: EndpointGetOne<P>
		create: EndpointCreate<P>
		update: EndpointUpdate<P>
	} {
		const find = this.createEndpointGet<P>(END_POINT.CATEGORIES)
		const create = this.createEndpointPost<P>(END_POINT.CATEGORIES)
		const update = this.createEndpointPost<P>(END_POINT.CATEGORIES)
		return {
			find: find as EndpointGetMany<P>,
			findOne: find as EndpointGetOne<P>,
			create,
			update,
		}
	}

	public postTag<P = WPTag>(): {
		find: EndpointGetMany<P>
		findOne: EndpointGetOne<P>
		create: EndpointCreate<P>
		update: EndpointUpdate<P>
	} {
		const find = this.createEndpointGet<P>(END_POINT.TAGS)
		const create = this.createEndpointPost<P>(END_POINT.TAGS)
		const update = this.createEndpointPost<P>(END_POINT.TAGS)
		return {
			find: find as EndpointGetMany<P>,
			findOne: find as EndpointGetOne<P>,
			create,
			update,
		}
	}

	public user<P = WPUser>(): {
		find: EndpointGetMany<P>
		findMe: EndpointGetOne<P>
		findOne: EndpointGetOne<P>
		create: EndpointCreate<P>
		update: EndpointUpdate<P>
		delete: (id: number) => Promise<boolean>
		deleteMe: () => Promise<boolean>
	} {
		const find = this.createEndpointGet<P>(END_POINT.USERS)
		const findMe = this.createEndpointGet<P>(END_POINT.USERS + '/me')
		const create = this.createEndpointPost<P>(END_POINT.USERS)
		const update = this.createEndpointPost<P>(END_POINT.USERS)
		const deleteOne = async (id: number) =>
			(await this.axios.delete<boolean>(END_POINT.USERS + `/${id}`)).data
		const deleteMe = async () =>
			(await this.axios.delete<boolean>(END_POINT.USERS + '/me')).data
		return {
			find: find as EndpointGetMany<P>,
			findMe: findMe as () => Promise<P>,
			findOne: find as EndpointGetOne<P>,
			create,
			update,
			delete: deleteOne,
			deleteMe,
		}
	}
}
