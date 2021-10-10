import { END_POINT } from './constants'
import {
	EndpointCreate,
	EndpointUpdate,
	WPCreate,
	WPMedia,
	WPPage,
	WPPost,
} from './types'
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
			error => {
				console.error(error)
				handleWpApiError(error, onError)
			},
		)
	}

	protected createEndpointGet<P>(
		endpoint: string,
		params?: Record<string, string>,
	): (id?: number) => Promise<P | P[]> {
		return async (id = 0) => {
			if (!id)
				return (
					await this.axios.get<P[]>(
						`/${endpoint}/${getDefaultQueryList(params)}`,
					)
				).data
			else
				return (
					await this.axios.get<P>(
						`/${endpoint}/${id}/${getDefaultQuerySingle(params)}`,
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
						`/${endpoint}/${id}`,
						{
							...body,
							fields: body.acf,
						},
					)
				).data
			else
				return (
					await this.axios.post<WPCreate<P>, AxiosResponse<P>>(
						`/${endpoint}`,
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
	): (body: T) => Promise<T | R> {
		return async (): Promise<T | R> => {
			return (await this.axios.get(`/${endPoint}`)).data
		}
	}

	protected createEndpointCustomPost<T, R = null>(
		endPoint: string,
	): (body: T) => Promise<T | R> {
		return async (body: T): Promise<T | R> => {
			return (await this.axios.post(`/${endPoint}`, body)).data
		}
	}

	public post<P = WPPost>(): {
		findAll: () => Promise<P[]>
		findOne: (id: number) => Promise<P>
		create: EndpointCreate<P>
		update: EndpointUpdate<P>
	} {
		const find = this.createEndpointGet<P>(END_POINT.POSTS)
		const create = this.createEndpointPost<P>(END_POINT.POSTS)
		const update = this.createEndpointPost<P>(END_POINT.POSTS)
		return {
			findAll: find as () => Promise<P[]>,
			findOne: find as (id: number) => Promise<P>,
			create,
			update,
		}
	}

	public page<P = WPPage>(): {
		findAll: () => Promise<P[]>
		findOne: (id: number) => Promise<P>
		create: EndpointCreate<P>
		update: EndpointUpdate<P>
	} {
		const find = this.createEndpointGet<P>(END_POINT.PAGES)
		const create = this.createEndpointPost<P>(END_POINT.PAGES)
		const update = this.createEndpointPost<P>(END_POINT.PAGES)
		return {
			findAll: find as () => Promise<P[]>,
			findOne: find as (id: number) => Promise<P>,
			create,
			update,
		}
	}

	public media<P = WPMedia>(): {
		findAll: () => Promise<P[]>
		findOne: (id: number) => Promise<P>
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
				throw new Error('The fileName must include the file extension.')
			return (
				await this.axios.post<Buffer, AxiosResponse<P>>(
					END_POINT.MEDIA,
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
			findAll: find as () => Promise<P[]>,
			findOne: find as (id: number) => Promise<P>,
			create,
			update,
		}
	}
}
