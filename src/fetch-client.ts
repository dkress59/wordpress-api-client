import { BlackWhiteList } from './types'
import { END_POINT_PROTECTED } from './constants'
import { handleWpError, validateBaseUrl } from './util'
import fetch from 'cross-fetch'

function isProtected(
	url: string,
	method: 'get' | 'post' | 'delete',
	protectedRoutes: BlackWhiteList,
): boolean {
	const protectedEndPoints =
		method === 'get'
			? protectedRoutes.GET
			: method === 'delete'
			? protectedRoutes.DELETE
			: protectedRoutes.POST
	return !!protectedEndPoints.filter(uri => url.includes(uri)).length
}

export class FetchClient {
	baseURL: string

	constructor(
		baseURL: URL,
		public authHeader: Record<string, string> = {},
		public onError: (message: string) => void = (message: string) => {
			throw new Error(message)
		},
		public protectedRoutes = END_POINT_PROTECTED,
	) {
		this.baseURL = validateBaseUrl(baseURL.toString()) + '/'
	}

	private async fetch<T>(
		url: string,
		method: 'get' | 'post' | 'delete',
		headers?: Record<string, string>,
		body?: BodyInit,
	) {
		body = body?.toString()
		try {
			if (isProtected(url, method, this.protectedRoutes))
				headers = { ...this.authHeader, ...headers }
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
