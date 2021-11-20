import { END_POINT_PROTECTED } from './constants'
import { getErrorMessage, isProtected, validateBaseUrl } from './util'
import fetch from 'cross-fetch'

export class FetchClient {
	baseUrl: string

	constructor(
		baseUrl: URL,
		public onError: (message: string) => void = (message: string) => {
			// eslint-disable-next-line no-console
			console.error(message)
			throw new Error(message)
		},
		public headers: Record<string, string> = {},
		public authHeader: Record<string, string> = {},
		public protectedRoutes = END_POINT_PROTECTED,
	) {
		this.baseUrl = validateBaseUrl(baseUrl.toString()) + '/'
	}

	/** returns undefined, if onError does not throw */
	private async fetch<T>(
		url: string,
		method: 'get' | 'post' | 'delete',
		headers?: Record<string, string>,
		body?: BodyInit,
	) {
		body = body?.toString()
		try {
			headers = { ...this.headers, ...headers }
			if (isProtected(url, method, this.protectedRoutes))
				headers = { ...this.authHeader, ...headers }
			const response = await fetch(this.baseUrl + url, {
				body,
				headers,
				method,
			})
			if (response.status >= 400) throw response
			return response.json() as unknown as T
		} catch (error: unknown) {
			const message = await getErrorMessage(error)
			this.onError(message)
		}
	}

	async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
		return (await this.fetch(url, 'get', headers)) as T
	}

	async post<T>(
		url: string,
		headers?: Record<string, string>,
		body?: BodyInit,
	): Promise<T> {
		return (await this.fetch(url, 'post', headers, body)) as T
	}

	async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
		return (await this.fetch(url, 'delete', headers)) as T
	}
}
