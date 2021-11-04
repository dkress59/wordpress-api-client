import { handleWpError, validateBaseUrl } from './util'
import fetch from 'cross-fetch'

export class FetchClient {
	baseURL: string
	onError: (message: string) => void

	constructor(
		baseURL: URL,
		public headers: Record<string, string> = {},
		onError?: (message: string) => void,
	) {
		this.baseURL = validateBaseUrl(baseURL.toString()) + '/'
		this.onError =
			onError ??
			((message: string) => {
				throw new Error(message)
			})
	}

	private async fetch<T>(
		url: string,
		method: 'get' | 'post' | 'delete',
		headers?: Record<string, string>,
		body?: BodyInit,
	) {
		try {
			headers = { ...this.headers, ...headers }
			const response = await fetch(this.baseURL + url, {
				body,
				headers,
				method,
			})
			if (response.status >= 400) throw response
			return response.json() as unknown as T
		} catch (error: unknown) {
			await handleWpError(error, this.onError)
			return Promise.reject()
		}
	}

	async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
		return await this.fetch(url, 'get', headers)
	}

	async post<T>(
		url: string,
		headers?: Record<string, string>,
		body?: BodyInit,
	): Promise<T> {
		return await this.fetch(url, 'post', headers, body)
	}

	async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
		return await this.fetch(url, 'delete', headers)
	}
}
