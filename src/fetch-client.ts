import { END_POINT_PROTECTED } from './constants'
import { getErrorMessage, isProtected, validateBaseUrl } from './util'
import fetch from 'cross-fetch'

export class FetchClient {
	baseUrl: string
	headers: Record<string, string>

	constructor(
		baseUrl: URL,
		public onError: (message: string) => void = (message: string) => {
			// eslint-disable-next-line no-console
			console.error(message)
		},
		headers: Record<string, string> = {},
		public authHeader: Record<string, string> = {},
		public protectedRoutes = END_POINT_PROTECTED,
	) {
		this.baseUrl = validateBaseUrl(baseUrl.toString()) + '/'
		this.headers = {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			...headers,
		}
	}

	/** will also throw if onError is defined */
	private async fetch<T>(
		url: string,
		method: 'get' | 'post' | 'delete',
		headers?: Record<string, string>,
		body?: BodyInit,
	): Promise<{ data: T; headers: Headers }> {
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
			return {
				data: (await response.json()) as T,
				headers: response.headers,
			}
		} catch (error) {
			const message = await getErrorMessage(error as Response)
			this.onError(message)
			throw new Error(message)
		}
	}

	async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
		return (await this.fetch<T>(url, 'get', headers)).data
	}

	async getAll<T>(
		url: string,
		headers?: Record<string, string>,
	): Promise<T[]> {
		const response = await this.fetch<T[] | undefined>(url, 'get', headers)
		const result = response.data ?? []
		const loadMore =
			result.length &&
			!url.includes('?page=') &&
			!url.includes('&page=') &&
			!url.includes('?offset=') &&
			!url.includes('&offset=')
		if (loadMore) {
			const totalPages = Number(response.headers.get('X-WP-TotalPages'))
			if (totalPages > 1) {
				for (let i = 1; i < totalPages; i++) {
					const page = await this.fetch<T[] | undefined>(
						url + '&page=' + String(i + 1),
						'get',
						headers,
					)
					result.push(...(page.data ?? []))
				}
			}
		}
		return result
	}

	async post<T>(
		url: string,
		headers?: Record<string, string>,
		body?: BodyInit,
	): Promise<T> {
		return (await this.fetch<T>(url, 'post', headers, body)).data
	}

	async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
		return (await this.fetch<T>(url, 'delete', headers)).data
	}
}
