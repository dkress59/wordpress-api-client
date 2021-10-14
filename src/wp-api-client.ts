import { END_POINT, ERROR_MESSAGE } from './constants'
import {
	EndpointCreate,
	EndpointDelete,
	EndpointFind,
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
	}

	protected createEndpointGet<P>(
		endpoint: string,
		params?: Record<string, string>,
	): EndpointFind<P> {
		return async (...ids: number[]) => {
			let result: P[] = []
			if (!ids.length) {
				result =
					(
						await this.axios.get<P[] | undefined>(
							`${endpoint}/${getDefaultQueryList(params)}`,
						)
					).data ?? ([] as P[])
			} else {
				result = (
					await Promise.all(
						ids.map(postId =>
							this.axios.get<P>(
								`${endpoint}/${postId}/${getDefaultQuerySingle(
									params,
								)}`,
							),
						),
					)
				).map(response => response.data)
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

	protected createEndpointDelete<P>(endpoint: string): EndpointDelete<P> {
		return async (...ids: number[]) => {
			return (
				await Promise.all(
					ids.map(id => this.axios.delete<P>(`${endpoint}/${id}`)),
				)
			).map(response => response.data)
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

	protected addPostType<P = WPPost>(
		endpoint: string,
	): {
		find: EndpointFind<P>
		create: EndpointCreate<P>
		delete: EndpointDelete<P>
		update: EndpointUpdate<P>
	} {
		return {
			find: this.createEndpointGet<P>(endpoint),
			create: this.createEndpointPost<P>(endpoint),
			update: this.createEndpointPost<P>(endpoint),
			delete: this.createEndpointDelete<P>(endpoint),
		}
	}

	public post<P = WPPost>(): {
		find: EndpointFind<P>
		create: EndpointCreate<P>
		delete: EndpointDelete<P>
		update: EndpointUpdate<P>
	} {
		return this.addPostType<P>(END_POINT.POSTS)
	}

	public page<P = WPPage>(): {
		find: EndpointFind<P>
		create: EndpointCreate<P>
		delete: EndpointDelete<P>
		update: EndpointUpdate<P>
	} {
		return this.addPostType<P>(END_POINT.PAGES)
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
		const deleteOne = this.createEndpointDelete<P>(END_POINT.MEDIA)
		const update = this.createEndpointPost<P>(END_POINT.MEDIA)
		return {
			find,
			create,
			delete: deleteOne,
			update,
		}
	}

	public postCategory<P = WPCategory>(): {
		find: EndpointFind<P>
		create: EndpointCreate<P>
		delete: EndpointDelete<P>
		update: EndpointUpdate<P>
	} {
		return this.addPostType<P>(END_POINT.CATEGORIES)
	}

	public postTag<P = WPTag>(): {
		find: EndpointFind<P>
		create: EndpointCreate<P>
		delete: EndpointDelete<P>
		update: EndpointUpdate<P>
	} {
		return this.addPostType<P>(END_POINT.TAGS)
	}

	public user<P = WPUser>(): {
		find: EndpointFind<P>
		findMe: () => Promise<P>
		create: EndpointCreate<P>
		update: EndpointUpdate<P>
		delete: EndpointDelete<P>
		deleteMe: () => Promise<boolean>
	} {
		const findMe = async () =>
			(await this.axios.get<P>(END_POINT.USERS + '/me')).data
		const deleteMe = async () =>
			(await this.axios.delete<boolean>(END_POINT.USERS + '/me')).data
		return {
			...this.addPostType<P>(END_POINT.USERS),
			findMe: findMe as () => Promise<P>,
			deleteMe,
		}
	}
}
