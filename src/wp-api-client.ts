import { END_POINT, ERROR_MESSAGE } from './constants'
import {
	EndpointCreate,
	EndpointUpdate,
	WPCategory,
	WPCreate,
	WPMedia,
	WPPage,
	WPPost,
	WPTag,
} from './types'
import { EndpointGetMany, EndpointGetOne } from 'src'
import {
	getDefaultQueryList,
	getDefaultQuerySingle,
	handleWpApiError,
	validateBaseUrl,
} from './util'
import axios, { AxiosInstance, AxiosResponse } from 'axios'

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
	): (id: undefined | number | number[]) => Promise<P | P[]> {
		return async (id = 0) => {
			if (!id)
				return (
					(
						await this.axios.get<P[] | undefined>(
							`${endpoint}/${getDefaultQueryList(params)}`,
						)
					).data ?? ([] as P[])
				)
			if (Array.isArray(id))
				return (
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
			return (
				await this.axios.get<P>(
					`${endpoint}/${id}/${getDefaultQuerySingle(params)}`,
				)
			).data
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
}
