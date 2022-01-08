import { AUTH_TYPE } from './types'
import { END_POINT_PROTECTED, END_POINT_PUBLIC } from './constants'
import { getErrorMessage, useAuth, validateBaseUrl } from './util'
import fetch from 'cross-fetch'

export class FetchClient {
	baseUrl: string
	headers: Record<string, string>

	constructor(
		baseUrl: URL,
		public onError: (message: string) => Promise<void> = (
			message: string,
		) => {
			// eslint-disable-next-line no-console
			console.error(message)
			return Promise.resolve()
		},
		headers: Record<string, string> = {},
		public authHeader: Record<string, string> = {},
		public protectedRoutes = END_POINT_PROTECTED,
		public publicRoutes = END_POINT_PUBLIC,
		public authType: AUTH_TYPE | undefined = undefined,
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
		headers?: HeadersInit,
		body?: BodyInit,
	): Promise<{ data: T; headers: Headers }> {
		try {
			headers = { ...this.headers, ...headers }
			if (
				useAuth(
					url,
					method,
					this.authType,
					this.protectedRoutes,
					this.publicRoutes,
				)
			)
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
			await this.onError(message)
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
				const pages = (
					await Promise.all(
						Array(totalPages - 1)
							.fill(null)
							.map((_null, i) => {
								return this.fetch<T[] | undefined>(
									`${url}&page=${String(i + 2)}`,
									'get',
									headers,
								)
							}),
					)
				).map(page => page.data ?? [])
				const entries: T[] = []
				pages.forEach(page => entries.push(...page))
				result.push(...entries)
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
