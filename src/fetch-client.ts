import { handleWpApiError, validateBaseUrl } from './util'
import fetch, { BodyInit, HeadersInit } from 'node-fetch'

export class FetchClient {
	baseURL: string
	onError: (message: string) => void

	constructor(
		baseURL: URL,
		public headers?: HeadersInit,
		onError?: (message: string) => void,
	) {
		this.baseURL = validateBaseUrl(baseURL.toString()) + '/'
		this.onError =
			onError ??
			((message: string) => {
				throw new Error(message)
			})
	}

	async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
		try {
			headers = { ...this.headers, ...headers }
			const response = await fetch(url, {
				headers,
				method: 'get',
				hostname: this.baseURL,
			})
			return response.json() as unknown as T
		} catch (error: unknown) {
			handleWpApiError(error, this.onError)
			return Promise.reject()
		}
	}

	async post<T>(
		url: string,
		headers?: HeadersInit,
		body?: BodyInit,
	): Promise<T> {
		try {
			headers = { ...this.headers, ...headers }
			const response = await fetch(url, {
				headers,
				body,
				method: 'post',
				hostname: this.baseURL,
			})
			return response.json() as unknown as T
		} catch (error: unknown) {
			handleWpApiError(error, this.onError)
			return Promise.reject()
		}
	}

	async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
		try {
			headers = { ...this.headers, ...headers }
			const response = await fetch(url, {
				headers,
				method: 'delete',
				hostname: this.baseURL,
			})
			return response.json() as unknown as T
		} catch (error: unknown) {
			handleWpApiError(error, this.onError)
			return Promise.reject()
		}
	}
}
